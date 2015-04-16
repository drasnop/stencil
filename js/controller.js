app.controller('optionsController', ['$scope', '$window', '$timeout', function($scope, $window, $timeout) {

   // provides access to model and dataManager in the html templates
   $scope.model = $window.model;
   $scope.dataManager = $window.dataManager;
   $scope.geometry = $window.geometry;

   // Return true if an option is visible 
   $scope.isOptionVisible = function(option, index) {
      var visible;

      // hide option when panel is hidden, to have entrance animation on showPanel
      if(!model.showPanel) {
         visible = false;
      }

      // Minimal panel: only selected options are shown
      else if(!model.fullPanel()) {
         if(option.selected)
            visible = true;
         else
            visible = false;
      }

      else if(model.fullPanel()) {
         // Full panel: hide options in show more shortcuts
         if(option.more && !model.showMoreShortcuts)
            visible = false;

         // Full panel: show only options from one tab (to have entrance effects)
         else if(option.tab == model.activeTab)
            visible = true;
         else
            visible = false;
      }

      updateIndex(option.tab.index, index, visible);
      return visible;
   }

   function updateIndex(tabIndex, index, visible) {
      if(index === 0) {
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
      for(var tab = 0; tab < tabIndex; tab++) {
         filtered += model.filteredIndex[tab][model.filteredIndex[tab].length - 1] + 1;
      }
      filtered += model.filteredIndex[tabIndex][index];
      return filtered;
   }

   $scope.activateTab = function(tab) {
      model.activeTab = tab;
      determineShowMoreShortcuts();
      // $scope.playEphemeralAnimation(false);
   }

   $scope.showPanel = function() {
      model.showPanel = true;

      if(model.fullPanel()) {
         computeTabCounts();

         var prevActiveTab = model.activeTab;
         computeActiveTab();

         if(model.activeTab == prevActiveTab) {
            // if same tab
            $scope.playEphemeralAnimation(false);
         }
         else {
            // if different tab
            //$scope.playEphemeralAnimation(true);
         }

         determineShowMoreShortcuts();
      }
   }

   $scope.expandToFullPanel = function(tab) {
      // stores current width and height, for animation
      $("#ad-hoc-panel").css("width", $("#ad-hoc-panel").width() + 1 + 'px')
      $("#ad-hoc-panel").css("height", $("#ad-hoc-panel").height() + 'px')

      model.panelExpanded = true;

      //positionPanel(); doesn't work

      computeTabCounts();

      if(typeof tabName != "undefined")
         model.activeTab = tab;
      else
         computeActiveTab();

      determineShowMoreShortcuts();

      $scope.playEphemeralAnimation(true);
   }

   $scope.contractFullPanel = function() {
      model.panelExpanded = false;

      //positionPanel(); doesn't work
   }

   $scope.closePanel = function() {
      model.showPanel = false;

      // cleanup selectedOptions
      model.selectedOptions = [];

      // revert back to the minimal panel    
      $scope.resetViewParameters();
   }

   $scope.resetViewParameters = function() {
      model.panelExpanded = false;
      $("#ad-hoc-panel").css("width", "");
      $("#ad-hoc-panel").css("height", "");
      /*model.showMoreShortcuts = false;*/
   }

   // highlight all elements that share at least one option with the current one
   $scope.reverseHighlight = function(option) {
      console.log(option.id)
      $(".customizable").filter(function() {
         return $(this).data("options").indexOf(option) >= 0;
      }).addClass("blue-highlighted")
   }

   // remove highlight on mouseleave
   $scope.removeReverseHighlight = function(option) {
      $(".customizable").filter(function() {
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


   function computeTabCounts() {
      // Reset counts
      model.tabs.forEach(function(tab) {
         tab.count = 0;
      })

      // Increment counts for each highlighted option in each tab
      model.selectedOptions.forEach(function(option) {
         // a positive value will be treated as true by the filters
         // if the option is hidden in a "more" section, it counts only as half
         option.tab.count += option.more ? 0.5 : 1;
      })
   }

   // Determine which tab sould be active, buy computing which tab has the most highlighted options
   // in case of equality, the first tab will be chosen
   function computeActiveTab() {
      var max = 0;
      model.tabs.forEach(function(tab) {
         if(tab.count > max) {
            max = tab.count;
            model.activeTab = tab;
         }
      })
   }

   // questionable workaround...
   function determineShowMoreShortcuts() {
      model.showMoreShortcuts = false;

      model.selectedOptions.forEach(function(option) {
         if(option.tab == model.activeTab && option.more)
            model.showMoreShortcuts = true;
      })
   }

}])
