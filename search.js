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

// Extract paragraph/verse number from text (at end or beginning)
function getVerseNumber(text) {
  // Try to find number at the beginning: "1. text"
  var match = text.match(/^(\d+)\.\s/);
  if (match) return match[1];
  
  // Try to find number at the end: "text, 4" or "text, 4."
  match = text.match(/,?\s*(\d+)\.?$/);
  if (match) return match[1];
  
  return null;
}

// Remove verse number from text
function stripVerseNumber(text) {
  // Remove from beginning: "1. text" -> "text"
  text = text.replace(/^\d+\.\s+/, '');
  // Remove from end: "text, 4" or "text, 4." -> "text"
  text = text.replace(/,?\s*\d+\.?$/, '');
  return text.trim();
}

// Extract snippets from text containing the query
function getSnippets(body, query, folder) {
  var lq = normBs(query);
  var out = [];
  
  // Only extract verse numbers for Sura files, not commentaries
  if (folder !== 'Sure') {
    var sents = body.split(/(?<=[.!?*])\s+/);
    for (var s = 0; s < sents.length; s++) {
      var sent = sents[s].trim();
      if (sent && normBs(sent).indexOf(lq) !== -1) {
        if (sent.length > 160) sent = sent.slice(0, 157) + "...";
        out.push({
          text: sent,
          verse: null
        });
      }
    }
    return out;
  }
  
  // For Sura files, find verse numbers
  var verseRegex = /(\d+)[.:]\s/g;
  var verses = [];
  var match;
  
  while ((match = verseRegex.exec(body)) !== null) {
    verses.push({
      num: match[1],
      pos: match.index,
      endNum: match[0].length
    });
  }
  
  // If no numbered verses found, just split by sentences
  if (verses.length === 0) {
    var sents = body.split(/(?<=[.!?*])\s+/);
    for (var s = 0; s < sents.length; s++) {
      var sent = sents[s].trim();
      if (sent && normBs(sent).indexOf(lq) !== -1) {
        if (sent.length > 160) sent = sent.slice(0, 157) + "...";
        out.push({
          text: sent,
          verse: null
        });
      }
    }
    return out;
  }
  
  // For each verse, extract the text between this verse and the next
  for (var v = 0; v < verses.length; v++) {
    var verseNum = verses[v].num;
    var startPos = verses[v].pos + verses[v].endNum;
    var endPos = (v < verses.length - 1) ? verses[v + 1].pos : body.length;
    
    var verseText = body.substring(startPos, endPos);
    
    // Check if query appears in this verse
    if (normBs(verseText).indexOf(lq) !== -1) {
      // Split into sentences
      var sents = verseText.split(/(?<=[.!?*])\s+/);
      
      for (var s = 0; s < sents.length; s++) {
        var sent = sents[s].trim();
        if (sent && normBs(sent).indexOf(lq) !== -1) {
          if (sent.length > 160) sent = sent.slice(0, 157) + "...";
          out.push({
            text: sent,
            verse: verseNum
          });
        }
      }
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
    var snippets = getSnippets(pg2.body, q, pg2.folder);
    totalSnips += snippets.length;
  }
  
  stat.textContent = totalSnips + ' rezultata pretrage "' + q + '". Pretraga je trajala ' + sec + ' sekundi.';
  
  var lastFolder = null;
  for (var i = 0; i < filtered.length; i++) {
    var page = null;
    for (var j = 0; j < pages.length; j++) {
      if (pages[j].id === filtered[i].id) {
        page = pages[j];
        break;
      }
    }
    
    // Add spacing between different folders
    if (lastFolder !== null && lastFolder !== page.folder) {
      var spacer = document.createElement('li');
      spacer.style.height = '50px';
      spacer.style.listStyle = 'none';
      list.appendChild(spacer);
    }
    lastFolder = page.folder;
    
    var snips = getSnippets(page.body, q, page.folder);
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = page.id;
    a.textContent = page.title;
    li.appendChild(a);
    
    for (var k = 0; k < snips.length; k++) {
      var d = document.createElement('div');
      d.className = 'snippet-line';
      
      var snippetHtml = highlight(snips[k].text, q);
      
      // Add verse number if available and it's from a Sura
      if (snips[k].verse && page.folder === 'Sure') {
        var verseNum = snips[k].verse;
        var suraNum = page.id.replace(/.*\/(\d+)\.htm.*/i, "$1");
        var verseLink = page.id.replace(/\.htm$/, '') + '.htm#ajet' + verseNum;
        snippetHtml = '<a href="' + verseLink + '" style="margin-right: 4px; color: #0066cc; font-style: italic; font-size: 0.9em; text-decoration: none; cursor: pointer;">ajet ' + verseNum + ':</a> ' + snippetHtml;
      }
      
      d.innerHTML = snippetHtml;
      li.appendChild(d);
    }
    
    list.appendChild(li);
  }
}
