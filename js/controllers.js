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
         if (option.more && !model.activeTab.showMoreOptions)
            visible = false;

         // Full panel: show only options from one tab (to have entrance effects)
         else if (option.tab == model.activeTab)
            visible = true;
         else
            visible = false;
      }

      updateIndex(option.tab.name, index, visible);
      return visible;
   }

   function updateIndex(tabName, index, visible) {
      if (index === 0) {
         model.filteredIndex[tabName][index] = visible ? 0 : -1;
         return;
      }

      model.filteredIndex[tabName][index] = model.filteredIndex[tabName][index - 1] + (visible ? 1 : 0);
   }

   // sum of 1 + index of the last element in each tab
   $scope.getTotalNumberVisibleOptions = function() {
      var count = 0;
      var indexesInTab;
      for (var tabName in model.filteredIndex) {
         indexesInTab = model.filteredIndex[tabName];
         count += indexesInTab[indexesInTab.length - 1] + 1;
      }
      return count;
   }

   // sum of filtered indexes in the tab preceding this one + filtered index in this tab
   $scope.getFilteredIndex = function(tab, index) {
      var filtered = 0;
      var indexesInTab;

      // enumerate tabs in order, skipping bloat tabs, stopping when the target tab is found
      for (var i = 0; i < model.tabs.length; i++) {
         if (!model.tabs[i].bloat) {
            var tabName = model.tabs[i].name;

            if (tabName == tab.name) {
               // get the filtered index of the target option in the target tab
               filtered += model.filteredIndex[tab.name][index];
               break;
            } else {
               // for all preceding tabs, add their maximal filtered index
               indexesInTab = model.filteredIndex[tabName];
               filtered += indexesInTab[indexesInTab.length - 1] + 1;
            }
         }
      }
      return filtered;
   }

   $scope.updateAppOption = function(option, oldValue) {
      // store the old value before updating the underlying option, hence updating hooks and clusters
      var clusterCollapsed = hooksManager.isClusterCollapsed(option);

      dataManager.updateAppOption(option.id, option.value, true);

      // log
      if (experiment.trial)
         experiment.trial.logValueChange(option, oldValue, clusterCollapsed);
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

      // log
      if (experiment.trial) {
         experiment.trial.panel.pushStamped({
            "action": "expanded"
         });
      }
   }

   $rootScope.contractFullPanel = function() {
      model.panelExpanded = false;
      //positionPanel(); doesn't work

      // log
      if (experiment.trial) {
         experiment.trial.panel.pushStamped({
            "action": "contracted"
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

      // saved visited tabs (count>0 indicates that the tab was highlighted)
      if (experiment.trial) {
         experiment.trial.visitedTabs.pushStamped({
            "tab": logger.flattenTab(tab)
         });
      }
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
      $("#ad-hoc-panel").css("width", "");
      $("#ad-hoc-panel").css("height", "");
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
