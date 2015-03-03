function initialize() {
   customizationMode = false;

   // create customization layer
   $("body").append("<div id='overlay'></div>");
   $("body").append("<div id='hooks'></div>");
   $("body").append("<div id='panels'></div>")
   $("#panels").append("<div id='ad-hoc-panel' ng-controller='optionsController' ad-hoc-panel></div>",
      "<a id='show-full-panel'>Other settings...</a>")

   console.log("Bootstrapping Angular");
   angular.bootstrap(document, ['myApp']);

   generateHooks();

   // hide the newly-created customization layer
   $("#overlay, #hooks, #panels").hide();

   // pre-load images
   jQuery.get("//localhost:8888/img/minus_dark_orange.png")
   jQuery.get("//localhost:8888/img/plus.png")
}


function enterCustomizationMode() {
   console.log("customization mode on");
   customizationMode = true;

   // sync angular options with the Wunderlist Backbone model
   angular.element($("#ad-hoc-panel")).scope().initializeOptions();

   // dim the interface
   $("body").children(":not(#overlay, #hooks, #panels)").addClass("dimmed");
   // $("#overlay").css("opacity",".4");   transitions are too slow, alas
   // super annoying workaround because of the way they defined the background image
   $("head").append("<style class='special-style'> #wunderlist-base::before{" +
      "-webkit-filter: grayscale(70%); filter: grayscale(70%);} </style>");

   // Wunderlist-specific: remove the animation class (use show/hide instead of height 0)
   $("head").append("<style class='special-style'> .sidebarItem.animate-up{" +
      "height: auto !important; transition: none !important} </style>");

   // update the customization layer
   updateHooksAndClusters();

   // show the customization layer
   $("#overlay, #hooks, #panels").show();
}


function exitCustomizationMode() {
   console.log("customization mode off")
   customizationMode = false;

   // hide customization layer
   $("#overlay, #hooks, #panels").hide();

   // return interface to its normal state
   $("body").children().removeClass("dimmed");
   $(".special-style").remove();
}


$(document).keyup(function(event) {
   if(event.keyCode == KEYCODE_ESC) {
      exitCustomizationMode();
      event.stopPropagation();
   }
});


function toggleCustomizationMode() {
   if(customizationMode === undefined)
      return;

   if(!customizationMode)
      enterCustomizationMode();
   else
      exitCustomizationMode();
}


function toggleOptionsVisibility() {
   var scope = angular.element($("#ad-hoc-panel")).scope();

   // cycle through the different options
   scope.model.optionsVisibility = (scope.model.optionsVisibility + 1) % 3;
   scope.resetViewParameters();
   scope.$apply();

   console.log("scope.model.optionsVisibility", scope.model.optionsVisibility);
}



///////////    helper functions     ////////////////////



var parentCSS = ["padding-top", "padding-right", "padding-bottom", "padding-left",
"border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
"margin-top", "margin-right", "margin-bottom", "margin-left",
"box-sizing", "display", "float",
"text-align", "font-size"
];

var childrenCSS = ["padding-top", "padding-right", "padding-bottom", "padding-left",
"border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
"margin-top", "margin-right", "margin-bottom", "margin-left",
"position", "top", "right", "bottom", "left",
"box-sizing", "display", "float",
"text-align", "font-size"
];

function getRelevantCSS(obj, relevantCSS) {
   var rules = {};
   for(var i in relevantCSS) {
      rules[relevantCSS[i]] = obj.css(relevantCSS[i]);
   }
   rules["box-sizing"]="content-box";
   return rules;
}

// return the objects that have the same options that the ones passed in argument
function haveSameOptions(input, options){
   return input.filter(function(){
      return sameElements($(this).data("options"), options)
   })
}

// return true if arrays a and b have the same elements (not necessarily in order)
function sameElements(a, b) {
   // assuming each element appears only once
   if(a.length != b.length)
      return false;

   for(var i in a){
      if(b.indexOf(a[i]) < 0)
         return false;
   }
   return true;
}

Object.defineProperty(Array.prototype, "indexOfProperty", {
   value: function(name, value) {
      for(var i in this) {
         if(this[i][name] === value)
            return i;
      }
      return -1;
   }
});

jQuery.fn.extend({
   robustHeight: function(){
      if(this.css("box-sizing")=="border-box")
         return this.outerHeight();
      else
         return this.height();
   }
})

jQuery.fn.extend({
   robustWidth: function(){
      if(this.css("box-sizing")=="border-box")
         return this.outerWidth();
      else
         return this.width() ;
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
   var x1 = parseInt(ghost1.css("left")) + ghost1.robustWidth()  / 2;
   var x2 = parseInt(ghost2.css("left")) + ghost2.robustWidth()  / 2;
   var y1 = parseInt(ghost1.css("top")) + ghost1.robustHeight() / 2;
   var y2 = parseInt(ghost2.css("top")) + ghost2.robustHeight() / 2;
   return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}


// Debug only
function getscope() {
   scope = angular.element($("#ad-hoc-panel")).scope();
}
