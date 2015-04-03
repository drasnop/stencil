function initialize() {
   customizationMode = false;

   // create customization layer
   $("body").append("<div id='overlay'></div>");
   $("body").append("<div id='hooks'></div>");
   $("body").append("<div id='panels'></div>")
   $("#panels").append("<div ng-controller='optionsController'  ad-hoc-panel></div")

   console.log("Bootstrapping Angular");
   angular.bootstrap(document, ['myApp']);

   // hide the newly-created customization layer
   $("#overlay, #hooks, #panels").hide();

   // pre-load images
   /*   jQuery.get("//localhost:8888/img/plus.png")*/
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

   // (re)create hooks and clusters for the customization layer
   generateHooks();
   updateHooksAndClusters();

   // show the customization layer
   $("#overlay, #hooks, #panels").show();
}


function exitCustomizationMode() {
   console.log("customization mode off")
   customizationMode = false;

   // close panel and reset views in angular
   var scope = angular.element($("#ad-hoc-panel")).scope();
   scope.$apply(scope.closeAdHocPanel);

   // delete all hooks (they will be recreated later)
   $(".customizable").remove();

   // hide customization layer
   $("#overlay, #hooks, #panels").hide();

   // return interface to its normal state
   $("body").children().removeClass("dimmed");
   $(".special-style").remove();
}


$(document).keyup(function(event) {
   if(event.keyCode == parameters.KEYCODE_ESC) {
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
   model.optionsVisibility = (model.optionsVisibility + 1) % 3;
   scope.resetViewParameters();
   scope.$apply();

   console.log("model.optionsVisibility", model.optionsVisibility);
}
