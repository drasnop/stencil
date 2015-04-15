app.controller('optionsController', ['$scope', '$window', '$timeout', function($scope, $window, $timeout) {
   
   // provides access to model and dataManager in the html templates
   $scope.model = $window.model;
   $scope.dataManager = $window.dataManager;

   $scope.isOptionVisible = function(option) {

      // hide option when panel is hidden, to have entrance animation on showPanel
      if(!model.showPanel)
         return false;

      // Minimal panel: only selected options are shown
      if(!model.fullPanel() && option.selected)
         return true;

      if(model.fullPanel()){
         // Full panel: hide options in show more shortcuts
         if(option.more && !model.showMoreShortcuts)
            return false;

         // Full panel: show only options from one tab (to have entrance effects)
         if(option.tab == model.activeTab)
            return true;
      }
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
      model.selectedOptions=[];

      // revert back to the minimal panel    
      $scope.resetViewParameters();
   }

   $scope.resetViewParameters = function() {
      model.panelExpanded = false;
      $("#ad-hoc-panel").css("width", "");
      $("#ad-hoc-panel").css("height", "");
      /*model.showMoreShortcuts = false;*/
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

   $scope.$watch('model.filteredOptions.length', function() {
      //console.log(model.filteredOptions.length,"filteredOptions",$(".option").length)
      $scope.adjustPanelHeightAsync();
   })


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


// Simply retrieves the option object from the option_ids
app.filter('getOptions', function() {
   return function(input) {
      return input.map(function(option_id) {
         return model.options[option_id];
      })
   }
})