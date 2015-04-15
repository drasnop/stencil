var app = angular.module('myApp', ['ngAnimate']);

app.run(['$location','$http', function($location, $http){

   // sets application flags based on the url, then load the appropriate data
   if($location.absUrl().indexOf("wunderlist") != -1){
      model.wunderlist=true;
      model.gmail=false;
      loadData("wunderlist");
   }
   else if($location.absUrl().indexOf("gmail") != -1){
      model.gmail=true;
      model.wunderlist=false;
      loadData("gmail");
   }
   else
      console.log("No options and mappings found for this website.")


   // retrieves the correct json files, populates the model and (so far) enterCustomizationMode
   function loadData(applicationName) {
      console.log("Loading " + applicationName + " options and mappings...")

      $http.get('//localhost:8888/data/mappings_' + applicationName + '.json').success(function(data) {
         console.log("Retrieved mappings")
         model.mappings = data;

         dataManager.initializeDataStructuresIfAllLoaded()
      });

      $http.get('//localhost:8888/data/options_' + applicationName + '.json').success(function(data) {
         console.log("Retrieved options list")
         model.options = data;

         dataManager.initializeDataStructuresIfAllLoaded()
      });

      $http.get('//localhost:8888/data/tabs_' + applicationName + '.json').success(function(data) {
         console.log("Retrieved tabs")
         model.tabs = data;

         dataManager.initializeDataStructuresIfAllLoaded()
      });
   }

}])


app.directive('adHocPanel', ['$sce', function($sce) {
   return {
      templateUrl: $sce.trustAsResourceUrl('//localhost:8888/html/options.html')
   };
}])
