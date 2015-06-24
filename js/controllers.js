app.controller('optionsController', ['$scope', '$rootScope', '$window', '$timeout', '$http', function($scope, $rootScope, $window, $timeout, $http) {

   // provides access to model and other global objects in the html template
   $scope.model = $window.model;
   $scope.parameters = $window.parameters;
   $scope.experiment = $window.experiment;
   $scope.logger = $window.logger;
   $scope.dataManager = $window.dataManager;
   $scope.options = $window.options;
   $scope.geometry = $window.geometry;


   /* Manage Panel */

   // called when clicking on a hook
   $scope.showPanel = function() {
      if (!model.showPanel)
         model.showPanel = true;

      if (model.fullPanel())
         $scope.activateTab(computeActiveTab());
   }

   $scope.closePanel = function() {
      model.showPanel = false;

      // cleanup selectedOptions
      model.selectedOptions = [];

      // revert back to the minimal panel    
      $scope.resetViewParameters();
      $(".hook").removeClass("hovered");
   }

   $scope.resizePanel = function() {
      $("#ad-hoc-panel").css({
         "height": geometry.getPanelHeight() + 'px'
      })
   }

   $scope.expandToFullPanel = function(tab) {
      model.panelExpanded = true;

      var newActiveTab = tab || computeActiveTab();
      $scope.activateTab(newActiveTab);

      // options.positionAllOptions has been called by activateTab

      // animate the expansion of the panel, and update its position at the end if needed
      $("#ad-hoc-panel").animate({
         "width": '590px',
         "height": geometry.getPanelHeight() + 'px',
      }, parameters.panelSizeChangeDuration, function() {

         // if necessary, re-position panel to account for the larger size
         positionPanel();

         // if necessary, scroll down to bring first highlighted element into view
         $("#options-list").animate({
            scrollTop: computeScrollOffset()
         }, 300)
      })

      // log
      if (experiment.trial) {
         experiment.trial.panel.pushStamped({
            "action": "expanded",
            "tab": newActiveTab.name
         });
      }
   }

   $rootScope.contractFullPanel = function() {
      model.panelExpanded = false;

      // need this trick to make sure the non-selected options disappear immediately
      // otherwise their index is updated before they visibility, and they jump to the top of the tab for a split second...
      setTimeout(function() {
         // we must update the filtered index first, to compute the new size of the panel      
         options.positionAllOptions();

         // animate the contraction of the panel, and update its position at the end if needed
         $("#ad-hoc-panel").animate({
            "width": "360px",
            "height": geometry.getPanelHeight() + 'px'
         }, parameters.panelSizeChangeDuration, function() {
            positionPanel();
            angular.element($("#ad-hoc-panel")).scope().$apply();
         })
      }, 0)


      // log
      if (experiment.trial) {
         experiment.trial.panel.pushStamped({
            "action": "contracted",
            "tab": model.activeTab.name
         });
      }
   }

   $scope.activateTab = function(tab) {
      // If the tab hasn't changed, we simply replay the animation
      /*      if(tab == model.activeTab)
               $scope.playEphemeralAnimation(false);
            else*/
      model.activeTab = tab;

      // automatically bring highlighted options into view
      if (!model.activeTab.bloat) {

         // determine whether to show additional options or not
         model.activeTab.showMoreOptions = determineShowMoreOptions();

         // if necessary, scroll down to bring first highlighted element into view
         $("#options-list").animate({
            scrollTop: computeScrollOffset()
         }, 500)
      }

      options.positionAllOptions();

      // saved visited tabs (count>0 indicates that the tab was highlighted)
      if (experiment.trial) {
         experiment.trial.visitedTabs.pushStamped({
            "tab": logger.flattenTab(tab)
         });
      }
   }

   // wrapper to allow cleaner logging
   $scope.updateAppOption = function(option, oldValue) {
      // store the old value before updating the underlying option, hence updating hooks and clusters
      var clusterCollapsed = hooksManager.isClusterCollapsed(option);

      dataManager.updateAppOption(option.id, option.value, true);

      // log
      if (experiment.trial)
         experiment.trial.logValueChange(option, oldValue, clusterCollapsed);
   }


   function computeScrollOffset() {
      // gather all the options highlighted in this tab
      var highlightedOptions = model.activeTab.options.filter(function(option) {
         return option.selected;
      })

      // for each option, compute the min and max scrollOffset that keep this option into view
      var viewport = parseInt($("#options-list").css("max-height"))
      var top,
         minimums = [],
         maximums = [];

      for (var i = 0; i < highlightedOptions.length; i++) {
         top = highlightedOptions[i].index * geometry.getOptionHeight();

         minimums.push(Math.max(top + geometry.getOptionHeight() - viewport, 0));
         maximums.push(top);
      }

      // find the optimal offset
      var offset = minimums[0];
      for (i = 0; i < highlightedOptions.length; i++) {
         if (minimums[i] < maximums[0]) {
            // the viewport is large enough to show both option 0 and i
            offset = minimums[i];
         } else {
            // the viewport is too small to show both option 0 and i
            // we move as far down as possible
            offset = maximums[0];
            break;
         }
      }
      return offset;
   }

   $scope.toggleShowMoreOptions = function() {
      model.activeTab.showMoreOptions = !model.activeTab.showMoreOptions;
      options.positionAllOptions();

      // log
      if (experiment.trial) {
         experiment.trial.showMoreOptions.pushStamped({
            "tab": model.activeTab.name,
            "action": model.activeTab.showMoreOptions ? "show" : "hide"
         })
      }
   }

   $scope.resetViewParameters = function() {
      model.panelExpanded = false;
      options.positionAllOptions();
      /*model.activeTab.showMoreOptions = false;*/
   }


   /* Reverse highlighting */


   // highlight all elements that share at least one option with the current one
   $scope.reverseHighlight = function(option) {
      if (!model.fullPanel())
         return;

      $(".highlightable").filter(function() {
         return $(this).data("options").indexOf(option) >= 0;
      }).addClass("blue-highlighted")

      if (experiment.trial)
         experiment.trial.reverseHighlighted.pushStamped({
            "option_ID": option.id
         });
   }

   // remove highlight on mouseleave
   $scope.removeReverseHighlight = function(option) {
      if (!model.fullPanel())
         return;

      $(".highlightable").filter(function() {
         return $(this).data("options").indexOf(option) >= 0;
      }).removeClass("blue-highlighted")
   }


   $scope.playEphemeralAnimation = function(animateTabs) {

      /*      $timeout(function() {

               $scope.$eval(function() {
                  console.log("playEphemeralAnimation")

                  var elements = animateTabs ? $(".delayed-entrance") : $(".option.delayed-entrance");

                  elements.css("opacity", 0)
                  elements.delay(100).animate({
                     opacity: 1
                  }, 500)
               })

            }, 10)*/
   }

   $scope.adjustPanelHeightAsync = function() {
      //console.log("before", $("#options-list").height())
      /*      $timeout(function() {
               //console.log("timeout", $("#options-list").height())
               $scope.$eval(adjustPanelHeight());
            }, 10)*/
   }

   $scope.filterOutBloatTabs = function(tab) {
      return !tab.bloat;
   }

   /* helper functions */


   // Determine which tab sould be active, buy computing which tab has the most highlighted options
   // in case of equality, the first tab will be chosen
   function computeActiveTab() {
      var max = 0;
      var argmax;
      model.tabs.forEachNonBloat(function(tab) {
         if (tab.count > max) {
            max = tab.count;
            argmax = tab;
         }
      })
      return argmax;
   }

   function determineShowMoreOptions() {
      if (!model.activeTab.hasMoreOptions)
         return false;

      // returns true if at least one highlighted option is under "show more"
      return model.activeTab.options.filter(function(option) {
         return option.selected && option.more;
      }).length > 0;
   }

}])


app.controller('instructionsModalController', ['$scope', '$window', function($scope, $window) {
   $scope.model = $window.model;
}])

app.controller('progressBarController', ['$scope', '$window', function($scope, $window) {
   $scope.model = $window.model;
}])
