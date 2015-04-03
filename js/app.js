var app = angular.module('myApp', []);

app.controller('optionsController', ['$scope', '$window', '$location', '$http', function($scope, $window, $location, $http) {
   // provides access to model in the html templates
   $scope.model=$window.model;

   loadOptionsAndMappings();

   $scope.initializeOptions = function() {

      console.log("Syncing options with underlying app...")

      // dev mode: not linked with Wunderlist backbone
      if(typeof sync == "undefined" || typeof sync.collections == "undefined")
         return;

      var value;
      for(var id in model.options) {
         // I am using booleans, but they are storing these options as strings!
         value = sync.collections.settings.where({
            key: id
         })[0].get("value")
         switch(value) {
            case "true":
               model.options[id].value = true;
               break;
            case "false":
               model.options[id].value = false;
               break;
            default:
               model.options[id].value = value;
         }

         // Hide the non-visible hooks (somewhat Wunderlist-specific, unfortunately)
         if(id.indexOf("visibility") >= 0) {
            switch(model.options[id].value) {
               case "auto":
               case "visible":
                  model.options[id].hidden = false;
                  break;
               case "hidden":
                  model.options[id].hidden = true;
                  break
            }
         }
      }
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

   $scope.computeActiveTab = function() {

      // Reset counts
      model.tabs.forEach(function(tab) {
         tab.count=0;
      })

      // Increment counts for each highlighted option in each tab
      model.selectedOptions.forEach(function(option_id) {
         var option = model.options[option_id];
         // a positive value will be treated as true by the filters
         // if the option is hidden in a "more" section, it counts only as half
         model.tabs.lookup[option.tab].count += option.more ? 0.5 : 1;
      })

      // Determine which tab sould be active, buy computing which tab has the most highlighted options
      // in case of equality, the first tab will be chosen
      var max = 0;
      model.tabs.forEach(function(tab) {
         if(tab.count > max) {
            max = tab.count;
            model.activeTab = tab.name;
         }
      })

      determineShowMoreShortcuts();
   }

   $scope.activateTab = function(tabName) {
      model.activeTab = tabName;
      determineShowMoreShortcuts();
   }

   $scope.showFullPanel = function(tabName) {
      model.panelExpanded = true;
      model.activeTab = tabName;
      determineShowMoreShortcuts();
   }

   $scope.hideFullPanel = function() {
      model.panelExpanded = false;
   }

   $scope.showBaselinePanel = function() {
      model.panelExpanded = true;
      model.activeTab = model.tabs[0].name;
   }

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


   // questionable workaround...
   function determineShowMoreShortcuts() {
      model.showMoreShortcuts = false;

      model.selectedOptions.map(function(id){
         return model.options[id];
      }).forEach(function(id, option) {
         if(option.tab == model.activeTab && option.more)
            model.showMoreShortcuts = true;
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
         model.mappings = data;

         // For debug purposes
         enterCustomizationModeIfAllLoaded()
      });

      $http.get('//localhost:8888/data/options_' + applicationName + '.json').success(function(data) {
         console.log("Retrieved options list")
         model.options = data;

         // For debug purposes
         enterCustomizationModeIfAllLoaded()
      });

      $http.get('//localhost:8888/data/tabs_' + applicationName + '.json').success(function(data) {
         console.log("Retrieved tabs")
         model.tabs = data;

         // add index information for future sorting
         for(var i = 0, len = model.tabs.length; i < len; i++) {
            model.tabs[i].index=i;
         }

         // creates a lookup object for access by tab name
         model.tabs.lookup = {};
         model.tabs.forEach(function(tab){
            model.tabs.lookup[tab.name]=tab;   
         })

         // For debug purposes
         enterCustomizationModeIfAllLoaded()
      });
   }

   function enterCustomizationModeIfAllLoaded(){
      if(Object.keys(model.options).length > 0 && model.mappings.length > 0 && model.tabs.length > 0 && !customizationMode)
         enterCustomizationMode();
   }
}])

app.directive('adHocPanel', ['$sce', function($sce) {
   return {
      templateUrl: $sce.trustAsResourceUrl('//localhost:8888/html/options.html')
   };
}])

// Sort the options according to their tab, and the order they appear in in that tabat
app.filter('orderByTab', function() {
   return function(input) {
      return input.sort(function(a, b) {
         var ta = model.tabs.lookup[a.tab].index,
            tb = model.tabs.lookup[b.tab].index;
         if(ta != tb)
            return ta - tb;
         return a.index - b.index;
      })
   }
})

// Filters out options in a "more" section if model.showMoreShortcuts or !.more
app.filter('filterShowMore', function() {
   return function(input) {
      if(model.showMoreShortcuts)
         return input;

      return input.filter(function(option_id) {
         return !model.options[option_id].more;
      })
   }
})

// Simply retrieves the option object from the option_ids
app.filter('getOptions', function() {
   return function(input) {
      return input.map(function(option_id) {
         return model.options[option_id];
      })
   }
})
