function initialize() {
   customizationMode = false;

   // hack into Wunderlist menu to create an access point to Customization Mode
   $("#user, .name.search-hidden").on("click", function() {
      // we must do this every time the menu is open, because it is apparently recreated
      replaceMenuEntryWhenReady();
   })

   // create customization layer
   $("body").append("<div id='customization-layer'></div>")
   $("#customization-layer").append("<div id='overlay'></div>")
      .append("<div id='hooks'></div>")
      .append("<div ad-hoc-panel></div")
      .append("<div id='close-icon' title='Exit customization mode'></div>")
   $("#close-icon").css("background-image", "url(//" + parameters.serverURL + "/img/close.png)")
      .on("click", exitCustomizationMode)

   // hide the newly-created customization layer
   $("#customization-layer").hide();

   // add experiment software
   if (parameters.experiment) {
      $("body>*").wrapAll("<div id='progress-bar-pusher'></div")
      $("body").prepend("<div progress-bar></div")
      $("body").append("<div instructions-modal></div")
   }

   // Setup Angular
   console.log("Bootstrapping Angular");
   angular.bootstrap(document, ['myApp']);

   // A call to dataManager.initializeDataStructuresIfAllLoaded will happen after Angular bootstraps
}


function replaceMenuEntryWhenReady() {
   setTimeout(function() {
      if ($(".list-menu li a[data-path='preferences/account']").length < 1)
         replaceMenuEntryWhenReady();
      else {
         // replace menu "Account settings" by "Customize"
         $(".list-menu li a[data-path='preferences/account']")
            .html("<text>Customize</text>")

         if (experiment.condition === 0) {
            // In control condition, reroute to the General tab
            $(".list-menu li a[data-path='preferences/account']")
               .attr("data-path", "preferences/general")
         } else {
            // For all other conditions, enter customization mode
            $(".list-menu li a[data-path='preferences/account']")
               .attr("data-path", "")
               .on("click", enterCustomizationMode)
         }
      }
   }, 10)
}


function enterCustomizationMode() {
   console.log("customization mode on");
   customizationMode = true;

   // IF NOT EXPERIMENT: sync angular options with the Wunderlist Backbone model
   if (!parameters.experiment)
      dataManager.initializeOptionsFromApp();

   // dim the interface
   if (parameters.experiment)
      $("#progress-bar-pusher").children(":not(#customization-layer)").addClass("dimmed");
   else
      $("body").children(":not(#customization-layer)").addClass("dimmed");
   // $("#overlay").css("opacity",".4");   transitions are too slow, alas
   // super annoying workaround because of the way they defined the background image
   $("head").append("<style class='special-style'> #wunderlist-base::before{" +
      "-webkit-filter: grayscale(70%); filter: grayscale(70%);} </style>");

   // Wunderlist-specific: remove the animation class (use show/hide instead of height 0)
   $("head").append("<style class='special-style'> .sidebarItem.animate-up{" +
      "height: auto !important; transition: none !important} </style>");

   // (re)create hooks and clusters for the customization layer, don't animate
   generateHooks();
   updateHooksAndClusters(false);

   // show the customization layer
   $("#customization-layer").show();

   // log
   if (experiment.trial && experiment.trial.time) {
      experiment.trial.time.enterCustomizationMode = performance.now();
   }
}


function exitCustomizationMode() {
   console.log("customization mode off")
   customizationMode = false;

   // close panel and reset views in angular
   var scope = angular.element($("#ad-hoc-panel")).scope();
   scope.$evalAsync(scope.closePanel);

   // delete all hooks (they will be recreated later)
   $(".hook").remove();

   // hide customization layer
   $("#customization-layer").hide();

   // return interface to its normal state
   $(".dimmed").removeClass("dimmed");
   $(".special-style").remove();
}


function toggleCustomizationMode() {
   if (typeof customizationMode === "undefined")
      return;

   if (!customizationMode)
      enterCustomizationMode();
   else
      exitCustomizationMode();
}


function toggleOptionsVisibility() {
   var scope = angular.element($("#ad-hoc-panel")).scope();

   // cycle through the different options
   model.optionsVisibility = (model.optionsVisibility + 1) % 4;
   scope.resetViewParameters();
   scope.$apply();

   console.log("model.optionsVisibility", model.optionsVisibility);
}
