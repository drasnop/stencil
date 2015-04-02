var app = angular.module('myApp', []);

app.controller('optionsController', ['$scope', '$window', '$location', '$http', function($scope, $window, $location, $http) {
   $scope.model = $window.model;

   loadOptionsAndMappings();

   $scope.closeAdHocPanel = function() {
      model.showPanel = false;

      // just to be sure, cleanup selectedOptions without deleting the array
      model.selectedOptions.length = 0;

      // revert back to the minimal panel    
      $scope.resetViewParameters();
   }

   $scope.resetViewParameters = function() {
      model.panelExpanded = false;
      /*model.showMoreShortcuts = false;*/
   }

   $scope.updateOption = function(id, value) {

      // dev mode possible: not linked with Wunderlist backbone
      if(typeof sync != "undefined" && typeof sync.collections != "undefined") {
         console.log("updating:", id, value)

         sync.collections.settings.where({
            key: id
         })[0].set({
            value: value
         })

         if(value == "hidden" || value == "visible" || value == "auto")
            updateHooksAndClusters();
      }
   }

   $scope.initializeOptions = function() {

      console.log("Syncing options with underlying app...")

      // dev mode: not linked with Wunderlist backbone
      if(typeof sync == "undefined" || typeof sync.collections == "undefined")
         return;

      var value;
      for(var id in $scope.model.options) {
         // I am using booleans, but they are storing these options as strings!
         value = sync.collections.settings.where({
            key: id
         })[0].get("value")
         switch(value) {
            case "true":
               $scope.model.options[id].value = true;
               break;
            case "false":
               $scope.model.options[id].value = false;
               break;
            default:
               $scope.model.options[id].value = value;
         }

         // Hide the non-visible hooks (somewhat Wunderlist-specific, unfortunately)
         if(id.indexOf("visibility") >= 0) {
            switch($scope.model.options[id].value) {
               case "auto":
               case "visible":
                  $scope.model.options[id].hidden = false;
                  break;
               case "hidden":
                  $scope.model.options[id].hidden = true;
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

   $scope.showBaselinePanel = function() {
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

   // load the appropriate data based on the url
   function loadOptionsAndMappings() {
      if($location.absUrl().indexOf("wunderlist") != -1)
         loadData("wunderlist")
      else if($location.absUrl().indexOf("gmail") != -1)
         loadData("gmail")
      else
         console.log("No options and mappings found for this website.")
   }

   // retrieves the correct json files, populates the model and (so far) enterCustomizationMode
   function loadData(applicationName) {
      console.log("Loading " + applicationName + " options and mappings...")

      $http.get('//localhost:8888/data/mappings_' + applicationName + '.json').success(function(data) {
         console.log("Retrieved mappings")
         $scope.model.mappings = data;

         // For debug purposes
         if($scope.model.options.length > 0 && $scope.model.tabs.length > 0)
            enterCustomizationMode();
      });

      $http.get('//localhost:8888/data/options_' + applicationName + '.json').success(function(data) {
         console.log("Retrieved options list")
         $scope.model.options = data;

         // For debug purposes
         if($scope.model.mappings.length > 0 && $scope.model.tabs.length > 0)
            enterCustomizationMode();
      });

      $http.get('//localhost:8888/data/tabs_' + applicationName + '.json').success(function(data) {
         console.log("Retrieved tabs")
         $scope.model.tabs = data;

         // For debug purposes
         if($scope.model.options.length > 0 && $scope.model.mappings.length > 0)
            enterCustomizationMode();
      });
   }
}])

app.directive('adHocPanel', ['$sce', function($sce) {
   return {
      templateUrl: $sce.trustAsResourceUrl('//localhost:8888/html/options.html')
   };
}])

app.filter('filterOptions', function() {
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

app.filter('filterOptionsByTab', function() {
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
app.filter('object2Array', function() {
   return function(input) {
      var out = [];
      for(var i in input) {
         out.push(input[i]);
      }
      return out;
   }
})
