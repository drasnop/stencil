///////////    helper functions     ////////////////////

var parentCSS = ["padding-top", "padding-right", "padding-bottom", "padding-left",
   "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
   "margin-top", "margin-right", "margin-bottom", "margin-left",
   "box-sizing", "display", "float",
   "text-align", "font-size"
];

function getRelevantCSS(obj, relevantCSS) {
   var rules = {};
   for(var i in relevantCSS) {
      rules[relevantCSS[i]] = obj.css(relevantCSS[i]);
   }
   rules["box-sizing"] = "content-box";
   return rules;
}

// return the objects that have the same options that the ones passed in argument
function haveSameOptions(input, options, reverse) {
   return input.filter(function() {
      return !reverse != !sameElements($(this).data("options"), options);
   })
}

// return the objects that have the same options that the ones passed in argument
function dontHaveSameOptions(input, options) {
   return haveSameOptions(input, options, true);
}

// return true if arrays a and b have the same elements (not necessarily in order)
function sameElements(a, b) {
   // assuming each element appears only once
   if(a.length != b.length)
      return false;

   for(var i in a) {
      if(b.indexOf(a[i]) < 0)
         return false;
   }
   return true;
}

// Resize the panel to create a vertical scrollbar instead of overflowing
function adjustPanelHeight() {
   // we leave a margin of 30px below the panel
   var wh = window.innerHeight - 30;
   var top = $("#ad-hoc-panel").offset().top;

   $("#options").css("height", "");
   // we want to keep the tabs always visible, so resize only the options list
   if(top + $("#ad-hoc-panel").height() > wh) {
      $("#options").height(wh - top - $("#tabs").height());


      if($("#ad-hoc-panel").offset().top < 30) {
         $("#ad-hoc-panel").offset({"top": 30});
         $("#options").height(wh - $("#ad-hoc-panel").offset().top - $("#tabs").height());
      }
   }

   //console.log("after adjustPanelHeight", $("#ad-hoc-panel").offset().top, $("#options").height())
}

// position the panel at the top right of the current anchor, if possible; otherwise flipfit it
function positionPanel(){
   $("#ad-hoc-panel").position({
      my: "left+10 top",
      at: "right top",
      of: model.selectedAnchor,
      collision: "flipfit fit"
   })
}

jQuery.fn.extend({
   robustHeight: function() {
      if(this.css("box-sizing") == "border-box")
         return this.outerHeight();
      else
         return this.height();
   }
})

jQuery.fn.extend({
   robustWidth: function() {
      if(this.css("box-sizing") == "border-box")
         return this.outerWidth();
      else
         return this.width();
   }
})

Math.mean = function(array) {
   var sum = 0;
   for(var i in array)
      sum += array[i]
   return sum / array.length;
}

// computes the Euclidian distance between two ghost anchors
function distance(ghost1, ghost2) {
   var x1 = parseInt(ghost1.css("left")) + ghost1.robustWidth() / 2;
   var x2 = parseInt(ghost2.css("left")) + ghost2.robustWidth() / 2;
   var y1 = parseInt(ghost1.css("top")) + ghost1.robustHeight() / 2;
   var y2 = parseInt(ghost2.css("top")) + ghost2.robustHeight() / 2;
   return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}


// Debug only
function getscope() {
   scope = angular.element($("#ad-hoc-panel")).scope();
}


function randomElementFrom(array){
   return array[Math.floor(Math.random()*array.length)];
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return;
}