angular.module('myApp', [])
.controller('optionsController', ['$scope','$window', function ($scope, $window) {
	$scope.options=$window.options;
	$scope.selectedOptions=$window.global.selectedOptions;
	
	// 0=minimum, 1=linked, 2=highlighted
	$scope.optionsVisibility=2;

	$scope.tabNames=["General","Shortcuts","Smart Lists","Notifications"];
	$scope.tabs={
		"General":0,
		"Shortcuts":0,
		"Shortcuts-more":0,
		"Smart Lists":0,
		"Notifications":0
	};
	$scope.currentTab="";

	$scope.updateOption=function(id,value){
		console.log("updating:",id,value)
		sync.collections.settings.where({key:id})[0].set({value:value})
	}

	$scope.onClickTab=function(tab){
		$scope.currentTab=tab;
	}

	$scope.initializeOptions=function(){
		var value;
		for(var id in options){
			// I am using booleans, but they are storing these options as strings!
			value=sync.collections.settings.where({key:id})[0].get("value")
			switch(value){
				case "true":
				options[id].value=true;
				break;
				case "false":
				options[id].value=false;
				break;
				default:
				options[id].value=value;
			}
		}
	}

	$scope.updateTabs=function(){
		for(var tab in $scope.tabs){
			$scope.tabs[tab]=0;
		}
		for(var i in $scope.selectedOptions){
			// a positive value will be treated as true by the filters
			$scope.tabs[$scope.options[$scope.selectedOptions[i]].tab]++;
		}

		// determine which tab sould be displayed, but computing which tab has the most highlighted options
		// in case of equality, the first tab will be chosen
		var max=0;
		for(tab in $scope.tabs){
			if($scope.tabs[tab] > max){
				max=$scope.tabs[tab];
				$scope.currentTab=tab;
			}
		}
	}
}])
.directive('adHocPanel', ['$sce', '$http', '$templateCache', '$compile',
	function($sce, $http, $templateCache, $compile) {

		return {
			link: function(scope, element, attrs) {
				// recompile the template everytime optionsVisibility changes
				scope.$watch('optionsVisibility', function() {

					var url;
					switch(scope.optionsVisibility){
						case 0:
						case 1:
							// need trustAsResourceUrl since we're loading from another domain
							url=$sce.trustAsResourceUrl('//localhost:8888/html/minimum-options.html');
						break;
						case 2:
							url=$sce.trustAsResourceUrl('//localhost:8888/html/highlighted-options.html');
						break;
					}

					$http.get(url, {cache: $templateCache})
					.success(function(response){
						element.html($compile(response)(scope));     
					})
				});
			}
		};
	}])
.filter('filterOptions', function(){
	return function(input){
		var output = {};
		$.each(input, function(name,option){
			for(var i in global.selectedOptions){
				if(global.selectedOptions[i] == name)
					output[name]=option;
			}
		});
		return output;
	}
})
.filter('filterTab', function(){
	return function(input, currentTab){
		var output={}
		for(var id in input){
			if(input[id].tab.indexOf(currentTab)>=0)
				output[id]=input[id];
		}
		return output;
	}
})