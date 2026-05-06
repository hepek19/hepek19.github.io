// Normalization function for Bosnian characters
function normBs(s) {
  if (!s) return "";
  return s.toLowerCase()
    .replace(/\u010d/g, "c")  // č -> c
    .replace(/\u0107/g, "c")  // ć -> c
    .replace(/\u0161/g, "s")  // š -> s
    .replace(/\u017e/g, "z")  // ž -> z
    .replace(/\u0111/g, "d"); // đ -> d
}

// Initialize normalized pages for fuzzy search
var pNorm = pages.map(function(p) {
  return {
    id: p.id,
    title: normBs(p.title),
    body: normBs(p.body)
  };
});

// Initialize lunr index for normalized (fuzzy-like) search
var lunrIdx = lunr(function() {
  this.field('title');
  this.field('body');
  this.ref('id');
  var self = this;
  pNorm.forEach(function(p) {
    self.add(p);
  });
});

// Fuzzy search on original text - only show results that actually contain the query
function fuzzySearch(query) {
  var hits = [];
  var lowerQuery = query.toLowerCase();
  
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    var titleLower = page.title.toLowerCase();
    var bodyLower = page.body.toLowerCase();
    
    // Check if query appears in title or body
    if (titleLower.indexOf(lowerQuery) !== -1 || bodyLower.indexOf(lowerQuery) !== -1) {
      hits.push({ id: page.id });
    }
  }
  
  return hits;
}

// Insert character at cursor position
function insertChar(ch) {
  var inp = document.getElementById('query');
  var s = inp.selectionStart;
  var e = inp.selectionEnd;
  inp.value = inp.value.slice(0, s) + ch + inp.value.slice(e);
  inp.selectionStart = inp.selectionEnd = s + 1;
  inp.focus();
  runSearch();
}

// Highlight matching text in snippets
function highlight(text, query) {
  var safe = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  var esc = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  var pat = "";
  
  // Build pattern that matches both original and normalized forms
  for (var i = 0; i < esc.length; i++) {
    var ch = esc[i].toLowerCase();
    if (ch === "c" || ch === "\u010d" || ch === "\u0107") pat += "[c\u010d\u0107]";
    else if (ch === "s" || ch === "\u0161") pat += "[s\u0161]";
    else if (ch === "z" || ch === "\u017e") pat += "[z\u017e]";
    else if (ch === "d" || ch === "\u0111") pat += "[d\u0111]";
    else pat += esc[i];
  }
  
  return safe.replace(new RegExp("(" + pat + ")", "gi"), "<b>$1</b>");
}

// Extract snippets from text containing the query
function getSnippets(body, query) {
  var sents = body.split(/(?<=[.!?*])\s+/);
  var lq = normBs(query);
  var out = [];
  
  for (var i = 0; i < sents.length; i++) {
    var s = sents[i].trim();
    if (s && normBs(s).indexOf(lq) !== -1) {
      if (s.length > 160) s = s.slice(0, 157) + "...";
      out.push(s);
    }
  }
  
  return out;
}

// Sort results by folder (Sure first) then by sura number
function sortById(a, b) {
  var pa = null;
  var pb = null;
  
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].id === a.id) pa = pages[i];
    if (pages[i].id === b.id) pb = pages[i];
  }
  
  var fa = pa && pa.folder === "Sure" ? 0 : 1;
  var fb = pb && pb.folder === "Sure" ? 0 : 1;
  
  if (fa !== fb) return fa - fb;
  
  var na = parseInt(a.id.replace(/.*\/(\d+)\.htm.*/i, "$1"), 10) || 0;
  var nb = parseInt(b.id.replace(/.*\/(\d+)\.htm.*/i, "$1"), 10) || 0;
  
  return na - nb;
}

// Precision search on original text (exact character matching)
function preciseSearch(query) {
  var hits = [];
  var lowerQuery = query.toLowerCase();
  
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    var titleLower = page.title.toLowerCase();
    var bodyLower = page.body.toLowerCase();
    
    // Check if query appears exactly (with no normalization)
    if (titleLower.indexOf(lowerQuery) !== -1 || bodyLower.indexOf(lowerQuery) !== -1) {
      hits.push({ id: page.id });
    }
  }
  
  return hits;
}

// Main search function
function runSearch() {
  var q = document.getElementById('query').value.trim();
  var mode = document.querySelector('input[name=mode]:checked').value;
  var list = document.getElementById('results');
  var stat = document.getElementById('status');
  
  list.innerHTML = "";
  stat.innerHTML = "";
  
  if (!q) return;
  
  var t0 = performance.now();
  var hits = [];
  
  if (mode === 'precise') {
    // Precision mode: exact character matching (no normalization)
    hits = preciseSearch(q);
  } else {
    // Fuzzy mode: just check if query appears somewhere in text
    hits = fuzzySearch(q);
  }
  
  var incK = document.getElementById('ukljuciKomentare').checked;
  var filtered = [];
  
  for (var i = 0; i < hits.length; i++) {
    var pg = null;
    for (var j = 0; j < pages.length; j++) {
      if (pages[j].id === hits[i].id) {
        pg = pages[j];
        break;
      }
    }
    
    if (!pg) continue;
    if (pg.folder === "SureKomentari" && !incK) continue;
    
    filtered.push(hits[i]);
  }
  
  filtered.sort(sortById);
  
  var sec = ((performance.now() - t0) / 1000).toFixed(2);
  
  if (filtered.length === 0) {
    stat.textContent = '0 rezultata pretrage "' + q + '".';
    return;
  }
  
  var totalSnips = 0;
  for (var i = 0; i < filtered.length; i++) {
    var pg2 = null;
    for (var j2 = 0; j2 < pages.length; j2++) {
      if (pages[j2].id === filtered[i].id) {
        pg2 = pages[j2];
        break;
      }
    }
    totalSnips += getSnippets(pg2.body, q).length;
  }
  
  stat.textContent = totalSnips + ' rezultat(a) pretrage "' + q + '". Pretraga je trajala ' + sec + ' sekundi.';
  
  for (var i = 0; i < filtered.length; i++) {
    var page = null;
    for (var j = 0; j < pages.length; j++) {
      if (pages[j].id === filtered[i].id) {
        page = pages[j];
        break;
      }
    }
    
    var snips = getSnippets(page.body, q);
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = page.id;
    a.textContent = page.title;
    li.appendChild(a);
    
    for (var k = 0; k < snips.length; k++) {
      var d = document.createElement('div');
      d.className = 'snippet-line';
      d.innerHTML = highlight(snips[k], q);
      li.appendChild(d);
    }
    
    list.appendChild(li);
  }
}
