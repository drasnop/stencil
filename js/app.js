var model = {
   // Type of ad-hoc panel shown: 0=minimum, 1=linked, 2=highlighted
   "optionsVisibility": 0,
   // Turn highlighting in the full panel view off in minimum
   highlighting: function(){
      var highlighting=[false, true, true];
      return highlighting[model.optionsVisibility];
   },
   // For the linked panel, whether the current view is minimal or expanded to full highlighted panel
   fullPanel: function(){
      var fullPanel=[false, false, true];
      return model.panelExpanded || fullPanel[model.optionsVisibility];
   },
   "panelExpanded":true,
   // Whether to show the full list of shortcuts
   "showMoreShortcuts": false,

   "tabs": [{
      "name": "General",
      "count": 0
   }, {
      "name": "Shortcuts",
      "count": 0
   }, {
      "name": "Smart Lists",
      "count": 0
   }, {
      "name": "Notifications",
      "count": 0
   }],
   "activeTab": "",

   "options": options,
   "selectedOptions": [],

   // hooks, x, y, icon, showGhosts
   "clusters": []
}

angular.module('myApp', [])
   .controller('optionsController', ['$scope', '$window', function($scope, $window) {
      $scope.model = $window.model;

      $scope.resetViewParameters = function() {
         model.panelExpanded = false;
         /*model.showMoreShortcuts = false;*/
      }

      $scope.updateOption = function(id, value) {
         console.log("updating:", id, value)

         // dev mode possible: not linked with Wunderlist backbone
         if(sync.collections !== undefined) {
            sync.collections.settings.where({
               key: id
            })[0].set({
               value: value
            })
         }

         if(value == "hidden" || value == "visible" || value == "auto")
            updateHooksAndClusters();
      }

      $scope.initializeOptions = function() {

         // dev mode: not linked with Wunderlist backbone
         if(sync.collections === undefined)
            return;

         var value;
         for(var id in options) {
            // I am using booleans, but they are storing these options as strings!
            value = sync.collections.settings.where({
               key: id
            })[0].get("value")
            switch(value) {
               case "true":
                  options[id].value = true;
                  break;
               case "false":
                  options[id].value = false;
                  break;
               default:
                  options[id].value = value;
            }

            // Hide the non-visible hooks (somewhat Wunderlist-specific, unfortunately)
            if(id.indexOf("visibility") >= 0) {
               switch(options[id].value) {
                  case "auto":
                  case "visible":
                     options[id].hidden = false;
                     break;
                  case "hidden":
                     options[id].hidden = true;
                     break
               }
            }
         }
      }

      // getter used for sorting options according to tab order
      $scope.getTabNameIndex = function(option) {
         return $scope.model.tabs.indexOfProperty("name", option.tab);
      }

      $scope.computeActiveTab = function() {
         // Reset counts and create a lookup object for easier access to counts
         var lookup = {};
         $scope.model.tabs.forEach(function(tab) {
            tab.count = 0;
            lookup[tab.name] = tab;
         })

         // Increment counts for each highlighted option in each tab
         $scope.model.selectedOptions.forEach(function(option_id) {
            var option = $scope.model.options[option_id];
            // a positive value will be treated as true by the filters
            // if the option is hidden in a "more" section, it counts only as half
            lookup[option.tab].count += option.more ? 0.5 : 1;
         })

         // Determine which tab sould be active, buy computing which tab has the most highlighted options
         // in case of equality, the first tab will be chosen
         var max = 0;
         $scope.model.tabs.forEach(function(tab) {
            if(tab.count > max) {
               max = tab.count;
               $scope.model.activeTab = tab.name;
            }
         })

         determineShowMoreShortcuts();
      }

      $scope.activateTab = function(tabName) {
         $scope.model.activeTab = tabName;

         determineShowMoreShortcuts();
      }

      $scope.showFullPanel = function(tabName) {
         $scope.model.panelExpanded = true;
         $scope.model.activeTab = tabName;
         determineShowMoreShortcuts();
      }

      $scope.hideFullPanel = function() {
         $scope.model.panelExpanded = false;
      }

      $scope.showBaselinePanel = function(){
         $scope.model.panelExpanded = true;
         $scope.model.activeTab = $scope.model.tabs[0].name;
      }

      // questionable workaround...
      function determineShowMoreShortcuts() {
         $scope.model.showMoreShortcuts = false;

         $.each($scope.model.options, function(id, option) {
            if(option.tab == $scope.model.activeTab && option.more &&
               $scope.model.selectedOptions.indexOf(option.id) >= 0)
               $scope.model.showMoreShortcuts = true;
         })
      }

      // For debug purposes
      toggleCustomizationMode();
   }])

.directive('adHocPanel', ['$sce', function($sce) {
   return {
      templateUrl: $sce.trustAsResourceUrl('//localhost:8888/html/options.html')
   };
}])

.filter('filterOptions', function() {
      return function(input) {
         var output = {};
         $.each(input, function(id, option) {
            for(var i in model.selectedOptions) {
               if(model.selectedOptions[i] == id)
                  output[id] = option;
            }
         });
         return output;
      }
   })
   .filter('filterOptionsByTab', function() {
      return function(input, activeTab, showMoreShortcuts) {
         var output = {};

         for(var id in input) {
            if(input[id].tab.indexOf(activeTab) >= 0 &&
               (!input[id].more || showMoreShortcuts)) {
               output[id] = input[id];
            }
         }
         return output;
      }
   })
   //http://stackoverflow.com/questions/19387552/angular-cant-make-ng-repeat-orderby-work
   .filter('object2Array', function() {
      return function(input) {
         var out = [];
         for(var i in input) {
            out.push(input[i]);
         }
         return out;
      }
   })
   // This filter doesn't filter anything, but sets a flag for each option
   .filter('determineAlternateHighlighting', function() {
      return function(options) {

         if(options.length === 0)
            return;

         // Higlight odd rows, unless there's only one, in which case it won't be highlighted
         var highlighted = true;
         var onlyOneTab = true;
         options[0].highlighted = highlighted;

         for(var i = 1; i < options.length; i++) {
            if(options[i].tab != options[i - 1].tab) {
               highlighted = !highlighted;
               onlyOneTab = false;
            }
            options[i].highlighted = highlighted;
         }

         // this is really not necessary, but it just looks better that way
         if(onlyOneTab) {
            options.forEach(function(option) {
               option.highlighted = false;
            })
         }

         return options;
      }
   })
