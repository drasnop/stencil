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
   updateHooks();
   bindListeners();

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
   return rules;
}

// return the objects that have at least one option in common with the ones passed in argument
function filterByCommonOption(input, options) {
   return input.filter(function() {
      return nonZeroIntersection($(this).data("options"), options)
   });
}

// returns true if arrays a and b have at least one element in common
function nonZeroIntersection(a, b) {
   var intersection =
      a.filter(function(element) {
         return b.indexOf(element) != -1;
      });
   return intersection.length > 0;
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

Math.mean = function(array) {
   var sum = 0;
   for(var i in array)
      sum += array[i]
   return sum / array.length;
}

// computes the Euclidian distance between two ghost anchors
function distance(ghost1, ghost2) {
   return Math.sqrt(Math.pow(ghost1.x - ghost2.x, 2) + Math.pow(ghost1.y - ghost2.y, 2));
}

function computeBarycenter (cluster) {
   cluster.x = Math.mean(cluster.ghosts.map(function(ghost) {
      return ghost.x;
   }))
   cluster.y = Math.mean(cluster.ghosts.map(function(ghost) {
      return ghost.y;
   }))
}

// Debug only
function getscope() {
   scope = angular.element($("#ad-hoc-panel")).scope();
}
