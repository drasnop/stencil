app.controller('optionsController', ['$scope', '$rootScope', '$window', '$timeout', '$http', function($scope, $rootScope, $window, $timeout, $http) {

   // provides access to model and dataManager in the html templates
   $scope.model = $window.model;
   $scope.parameters = $window.parameters;
   $scope.experiment = $window.experiment;
   $scope.logger = $window.logger;
   $scope.dataManager = $window.dataManager;
   $scope.geometry = $window.geometry;


   /* Manage options */


   // Return true if an option is visible 
   $scope.isOptionVisible = function(option, index) {
      var visible;

      // hide option when panel is hidden, to have entrance animation on showPanel
      if (!model.showPanel) {
         visible = false;
      }

      // Minimal panel: only selected options are shown
      else if (!model.fullPanel()) {
         if (option.selected)
            visible = true;
         else
            visible = false;
      } else if (model.fullPanel()) {
         // Full panel: hide options in show more shortcuts
         if (option.more && !model.showMoreShortcuts)
            visible = false;

         // Full panel: show only options from one tab (to have entrance effects)
         else if (option.tab == model.activeTab)
            visible = true;
         else
            visible = false;
      }

      updateIndex(option.tab.index, index, visible);
      return visible;
   }

   function updateIndex(tabIndex, index, visible) {
      if (index === 0) {
         model.filteredIndex[tabIndex][index] = visible ? 0 : -1;
         return;
      }

      model.filteredIndex[tabIndex][index] = model.filteredIndex[tabIndex][index - 1] + (visible ? 1 : 0);
   }

   $scope.getTotalNumberVisibleOptions = function() {
      return model.filteredIndex.reduce(function(count, tabIndexes) {
         return count + tabIndexes[tabIndexes.length - 1] + 1;
      }, 0)
   }

   $scope.getFilteredIndex = function(tabIndex, index) {
      var filtered = 0;
      for (var tab = 0; tab < tabIndex; tab++) {
         filtered += model.filteredIndex[tab][model.filteredIndex[tab].length - 1] + 1;
      }
      filtered += model.filteredIndex[tabIndex][index];
      return filtered;
   }


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

   $scope.expandToFullPanel = function(tab) {
      // stores current width and height, for animation
      $("#ad-hoc-panel").css("width", $("#ad-hoc-panel").width() + 1 + 'px')
      $("#ad-hoc-panel").css("height", $("#ad-hoc-panel").height() + 'px')

      model.panelExpanded = true;

      //positionPanel(); doesn't work

      if (typeof tab == "undefined")
         $scope.activateTab(computeActiveTab());
      else
         $scope.activateTab(tab);
   }

   $rootScope.contractFullPanel = function() {
      model.panelExpanded = false;
      //positionPanel(); doesn't work
   }

   $scope.activateTab = function(tab) {
      // If the tab hasn't changed, we simply replay the animation
      /*      if(tab == model.activeTab)
               $scope.playEphemeralAnimation(false);
            else*/
      model.activeTab = tab;

      // determine whether to who additional options or not
      determineShowMoreShortcuts();

      // saved visited tabs
      experiment.trial.visitedTabs.push(logger.compressTab(tab));
   }

   $scope.resetViewParameters = function() {
      model.panelExpanded = false;
      $("#ad-hoc-panel").css("width", "");
      $("#ad-hoc-panel").css("height", "");
      /*model.showMoreShortcuts = false;*/
   }


   /* Reverse highlighting */


   // returns true if this option is anchored and at least one anchor is visible
   $scope.anchorVisible = function(option) {
      return option.anchored && $(".highlightable").filter(function() {
         return $(this).data("options").indexOf(option) >= 0;
      }).filter(":visible").length > 0;
   }

   // highlight all elements that share at least one option with the current one
   $scope.reverseHighlight = function(option) {
      if (!model.fullPanel())
         return;

      $(".highlightable").filter(function() {
         return $(this).data("options").indexOf(option) >= 0;
      }).addClass("blue-highlighted")

      if (experiment.experiment)
         experiment.trial.reverseHighlighted.push(logger.compressOption(option));
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
      //console.log("before", $("#options").height())
      /*      $timeout(function() {
               //console.log("timeout", $("#options").height())
               $scope.$eval(adjustPanelHeight());
            }, 10)*/
   }


   /* helper functions */


   // Determine which tab sould be active, buy computing which tab has the most highlighted options
   // in case of equality, the first tab will be chosen
   function computeActiveTab() {
      var max = 0;
      var argmax;
      model.tabs.forEach(function(tab) {
         if (tab.count > max) {
            max = tab.count;
            argmax = tab;
         }
      })
      return argmax;
   }

   // questionable workaround...
   function determineShowMoreShortcuts() {
      model.showMoreShortcuts = false;

      model.selectedOptions.forEach(function(option) {
         if (option.tab == model.activeTab && option.more)
            model.showMoreShortcuts = true;
      })
   }

}])


app.controller('instructionsModalController', ['$scope', '$window', function($scope, $window) {
   $scope.model = $window.model;
}])

app.controller('progressBarController', ['$scope', '$window', function($scope, $window) {
   $scope.model = $window.model;
}])
