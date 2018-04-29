/*
 * Bootstrap the Angular app; load options, mappings and tabs; creates the directive.
 * Also define a function to automatically delete the Wunderlist account.
 */


var app = angular.module('myApp', ['ngSanitize']);

app.run(['$location', '$http', '$q', '$rootScope', function($location, $http, $q, $rootScope) {

   // sets application flags based on the url, then load the appropriate data
   // if ($location.absUrl().indexOf("wunderlist") != -1) {
   //    model.wunderlist = true;
   //    model.gmail = false;
   //    loadData("wunderlist");
   // } 
   if ($location.absUrl().indexOf("gmail") != -1) {
      model.gmail = true;
      model.wunderlist = false;
      loadData("gmail");
   } else {
      model.wunderlist = true;
      model.gmail = false;
      loadData("wunderlist");
   }


   // retrieves the correct json files, populates the model and (so far) enterCustomizationMode
   function loadData(applicationName) {
      console.log("Loading " + applicationName + " options, mappings and tabs...")

      var promises = ["options", "mappings", "tabs"].map(function(objectName) {
         return requestJSON(applicationName, objectName);
      });

      $q.all(promises).then(function(data) {
         console.log("All data loaded")
         dataManager.initializeDataStructuresIfAllLoaded();
      })

   }

   function requestJSON(applicationName, objectName) {
      return $http.get('//' + parameters.serverURL + '/data/' + objectName + '_' + applicationName + '.json').success(function(data) {
         console.log("Retrieved ", objectName)
         model[objectName] = data;
      });
   }

   $rootScope.deleteAccount = function() {

      if (typeof sync == "undefined" || typeof sync.options == "undefined") {
         console.log("No Wunderlist account to delete!");
         return;
      }

      console.log("deleting account...")

      $http.delete("https://a.wunderlist.com/api/v1/user", {
         params: {
            "password": "experiment!"
         },
         headers: {
            "x-client-id": sync.options.clientID,
            "x-access-token": sync.options.accessToken,
            "Content-Type": "application/json; charset=utf-8"
         }
      }).success(function() {
         alert("This Wunderlist account will self-destruct once you finish reading this message.");
      });
   }

}])


app.directive('adHocPanel', ['$sce', function($sce) {
   return {
      replace: true,
      templateUrl: $sce.trustAsResourceUrl('//' + parameters.serverURL + '/html/options.html')
   };
}])

app.directive('instructionsModal', ['$sce', function($sce) {
   return {
      replace: true,
      templateUrl: $sce.trustAsResourceUrl('//' + parameters.serverURL + '/html/instructions-modal.html')
   };
}])

app.directive('progressBar', ['$sce', function($sce) {
   return {
      replace: true,
      templateUrl: $sce.trustAsResourceUrl('//' + parameters.serverURL + '/html/progress-bar.html')
   };
}])

app.directive('intermediate', ['$sce', function($sce) {
   return {
      replace: true,
      templateUrl: $sce.trustAsResourceUrl('//' + parameters.serverURL + '/html/intermediate.html')
   };
}])
