var app = angular.module('myApp', ['ngAnimate']);

app.run(['$location','$http', '$q', function($location, $http, $q){

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
      console.log("Loading " + applicationName + " options, mappings and tabs...")

      var promises = ["options","mappings","tabs"].map(function(objectName){
         return requestJSON(applicationName, objectName);
      });

      $q.all(promises).then(function(data){
         console.log("All data loaded")
         dataManager.initializeDataStructuresIfAllLoaded();
      })

   }

   function requestJSON(applicationName, objectName){
      return  $http.get('//localhost:8888/data/'+objectName + '_' + applicationName + '.json').success(function(data) {
         console.log("Retrieved ", objectName)
         model[objectName] = data;
      });
   }

}])


app.directive('adHocPanel', ['$sce', function($sce) {
   return {
      replace: true,
      templateUrl: $sce.trustAsResourceUrl('//localhost:8888/html/options.html')
   };
}])
