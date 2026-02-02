document.write("<TEXTAREA ID='holdtext' STYLE='display:none;'></TEXTAREA>");

var sPath = window.location.pathname;
var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);

sPage = sPage.substring(0, sPage.lastIndexOf('.'));

createCookie('LastSura', sPage, 7);

function createCookie(name,value,days) {
   if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
   } else var expires = "";
   
   document.cookie = name + "=" + value + expires + '; path=/';
}

function CopyToClipboard (FusNota) {
   // copy fus-note to a clipboard
   if (document.all) {
       holdtext.innerText = FusNota;
       Copied = holdtext.createTextRange();
       Copied.execCommand("RemoveFormat");
       Copied.execCommand("Copy");
   }
}

function ShowHideFusNote() {
    // get all the DIV elements and store them in array
    myDivElements = document.getElementsByTagName("div");

    for (cnt=0; cnt<myDivElements.length; cnt++) {
        var iState = myDivElements.item(cnt).style.visibility;

        if (myDivElements.item(cnt).getAttribute('fus_nota')) {  // sakri je samo ako div ima fus_notu
           if (iState == 'hidden') {
               myDivElements.item(cnt).style.visibility = 'visible';
           } else {
               myDivElements.item(cnt).style.visibility = 'hidden';
           }
        }
    } 
}

function ScroolHeader(headerObject) {
   headerObject.style.top = document.body.scrollTop
}

function doTooltip(e, msg) {
   if (typeof Tooltip == "undefined" || !Tooltip.ready) return;
   Tooltip.show(e, msg);
}

function hideTip() {
   if ( typeof Tooltip == "undefined" || !Tooltip.ready ) return;
   Tooltip.hide();
}

/*************************************************************************
 dw_event.js (version date Feb 2004)
*************************************************************************/

var dw_event = {
  add: function(obj, etype, fp, cap) {
    cap = cap || false;
    if (obj.addEventListener) obj.addEventListener(etype, fp, cap);
    else if (obj.attachEvent) obj.attachEvent("on" + etype, fp);
  }, 

  remove: function(obj, etype, fp, cap) {
    cap = cap || false;
    if (obj.removeEventListener) obj.removeEventListener(etype, fp, cap);
    else if (obj.detachEvent) obj.detachEvent("on" + etype, fp);
  }, 

  DOMit: function(e) { 
    e = e? e: window.event;
    e.tgt = e.srcElement? e.srcElement: e.target;
    
    if (!e.preventDefault) e.preventDefault = function () { return false; }
    if (!e.stopPropagation) e.stopPropagation = function () { if (window.event) window.event.cancelBubble = true; }
        
    return e;
  }
}

/*************************************************************************
dw_viewport.js  version date Nov 2003
*************************************************************************/  
  
viewport = {
  getWinWidth: function () {
    this.width = 0;
    if (window.innerWidth) this.width = window.innerWidth - 18;
    else if (document.documentElement && document.documentElement.clientWidth) 
      this.width = document.documentElement.clientWidth;
    else if (document.body && document.body.clientWidth) 
      this.width = document.body.clientWidth;
  },
  
  getWinHeight: function () {
    this.height = 0;
    if (window.innerHeight) this.height = window.innerHeight - 18;
   else if (document.documentElement && document.documentElement.clientHeight) 
      this.height = document.documentElement.clientHeight;
   else if (document.body && document.body.clientHeight) 
      this.height = document.body.clientHeight;
  },
  
  getScrollX: function () {
    this.scrollX = 0;
   if (typeof window.pageXOffset == "number") this.scrollX = window.pageXOffset;
   else if (document.documentElement && document.documentElement.scrollLeft)
      this.scrollX = document.documentElement.scrollLeft;
   else if (document.body && document.body.scrollLeft) 
      this.scrollX = document.body.scrollLeft; 
   else if (window.scrollX) this.scrollX = window.scrollX;
  },
  
  getScrollY: function () {
    this.scrollY = 0;    
    if (typeof window.pageYOffset == "number") this.scrollY = window.pageYOffset;
    else if (document.documentElement && document.documentElement.scrollTop)
      this.scrollY = document.documentElement.scrollTop;
    else if (document.body && document.body.scrollTop) 
      this.scrollY = document.body.scrollTop; 
    else if (window.scrollY) this.scrollY = window.scrollY;
  },
  
  getAll: function () {
    this.getWinWidth(); this.getWinHeight();
    this.getScrollX();  this.getScrollY();
  }
}

/*************************************************************************
dw_tooltip.js
************************************************************************/

var Tooltip = {
  followMouse: true,
  offX: 8,
  offY: 12,
  
  ready: false,
  t1: null,
  t2: null,
  tipID: "tipDiv",
  tip: null,
  
  init: function() {
    if ( document.createElement && document.body && typeof document.body.appendChild != "undefined" ) {
      var el = document.createElement("DIV");
      el.className = "tooltip";
      el.id = this.tipID;
      document.body.appendChild(el);
      this.ready = true;
    }
  },
  
  show: function(e, msg) {
    if (this.t1) clearTimeout(this.t1);   
    if (this.t2) clearTimeout(this.t2); 
    this.tip = document.getElementById( this.tipID );
    // set up mousemove 
    if (this.followMouse) 
      dw_event.add( document, "mousemove", this.trackMouse, true );
    this.writeTip("");  // for mac ie
    this.writeTip(msg);
    viewport.getAll();
    this.positionTip(e);
    this.t1 = setTimeout("document.getElementById('" + Tooltip.tipID + "').style.visibility = 'visible'",200); 
    },
    
    writeTip: function(msg) {
      if ( this.tip && typeof this.tip.innerHTML != "undefined" ) this.tip.innerHTML = msg;
    },
    
    positionTip: function(e) {
      var x = e.pageX? e.pageX: e.clientX + viewport.scrollX;
      var y = e.pageY? e.pageY: e.clientY + viewport.scrollY;

      if ( x + this.tip.offsetWidth + this.offX > viewport.width + viewport.scrollX )
        x = x - this.tip.offsetWidth - this.offX;
      else x = x + this.offX;
    
      if ( y + this.tip.offsetHeight + this.offY > viewport.height + viewport.scrollY )
        y = ( y - this.tip.offsetHeight - this.offY > viewport.scrollY )? y - this.tip.offsetHeight - this.offY : viewport.height + viewport.scrollY - this.tip.offsetHeight;
      else y = y + this.offY;
  
      this.tip.style.left = x + "px"; this.tip.style.top = y + "px";
    },
    
    hide: function() {
      if (this.t1) clearTimeout(this.t1); 
      if (this.t2) clearTimeout(this.t2); 
      this.t2 = setTimeout("document.getElementById('" + this.tipID + "').style.visibility = 'hidden'",200);
      // release mousemove
      if (this.followMouse) 
         dw_event.remove( document, "mousemove", this.trackMouse, true );
      this.tip = null;
    },
    
    trackMouse: function(e) {
      e = dw_event.DOMit(e);
      Tooltip.positionTip(e); 
    }
}

Tooltip.init();