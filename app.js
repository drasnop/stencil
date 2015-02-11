angular.module('myApp', [])
.controller('optionsController', ['$scope','$window', function ($scope, $window) {
	$scope.options=$window.options;
	$scope.tabs={
		"general":0,
		"shortcuts":0,
		"shortcuts-more":0,
		"smartlists":0,
		"notifications":0
	}

	// 0=minimum, 1=linked, 2=highlighted
	$scope.optionsVisibility=2;

	$scope.currentTab="";
	$scope.selectedOptions=$window.global.selectedOptions;

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
			if(input[id].tab == currentTab)
				output[id]=input[id];
		}
		return output;
	}
})