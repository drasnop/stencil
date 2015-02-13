angular.module('myApp', [])
.controller('optionsController', ['$scope','$window', function ($scope, $window) {
	$scope.options=$window.options;
	$scope.selectedOptions=$window.global.selectedOptions;
	
	// 0=minimum, 1=linked, 2=highlighted
	$scope.optionsVisibility=2;
	$scope.linkedPanels=true;

	$scope.tabNames=["General","Shortcuts","Smart Lists","Notifications"];
	$scope.tabCounts={
		"General":0,
		"Shortcuts":0,
		"Smart Lists":0,
		"Notifications":0
	};
	$scope.activeTab="";
	$scope.showMoreShortcuts=false;
	$scope.test=false;

	$scope.updateOption=function(id,value){
		console.log("updating:",id,value)
		sync.collections.settings.where({key:id})[0].set({value:value})
	}

	$scope.onClickTab=function(tab){
		$scope.activeTab=tab;
	}

	$scope.toggleShowMoreShortcuts=function(){
		$scope.showMoreShortcuts= !$scope.showMoreShortcuts;
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

	$scope.getTabNameIndex=function(option){
		return $scope.tabNames.indexOf(option.tab);
	}

	$scope.computeActiveTab=function(){
		var tab;
		for(tab in $scope.tabCounts){
			$scope.tabCounts[tab]=0;
		}
		for(var i in $scope.selectedOptions){
			tab=$scope.options[$scope.selectedOptions[i]].tab;
			// a positive value will be treated as true by the filters
			$scope.tabCounts[tab]++;
		}

		// determine which tab sould be active, buy computing which tab has the most highlighted options
		// in case of equality, the first tab will be chosen
		var max=0;
		for(i in $scope.tabNames){
			tab=$scope.tabNames[i];
			if($scope.tabCounts[tab] > max){
				max=$scope.tabCounts[tab];
				$scope.activeTab=tab;
			}
		}
	}

	$scope.showFullPanel=function(tab){
		$scope.optionsVisibility=2;
		$scope.activeTab=tab;
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
						// need trustAsResourceUrl since we're loading from another domain
						case 0:
						url=$sce.trustAsResourceUrl('//localhost:8888/html/minimum-options.html');
						break;
						case 1:
						url=$sce.trustAsResourceUrl('//localhost:8888/html/linked-options.html');
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
		$.each(input, function(id,option){
			for(var i in global.selectedOptions){
				if(global.selectedOptions[i] == id)
					output[id]=option;
			}
		});
		return output;
	}
})
.filter('filterOptionsByTab', function(){
	return function(input, activeTab, showMoreShortcuts){
		// in minimum-options, showMoreShortcuts is undefined, but we act as if it is true
		showMoreShortcuts = (typeof showMoreShortcuts !== 'undefined') ? showMoreShortcuts : true;
		var output={}
		for(var id in input){
			if(input[id].tab.indexOf(activeTab)>=0 &&
				(!input[id].more || showMoreShortcuts))
				output[id]=input[id];
		}
		return output;
	}
})
.filter('filterNonEmptyTabs', function(){
	return function(tabNames, tabCounts){
		return tabNames.filter(function(tab){
			return tabCounts[tab]>0;
		});
	}
})
//http://stackoverflow.com/questions/19387552/angular-cant-make-ng-repeat-orderby-work
.filter('object2Array', function() {
	return function(input) {
		var out = []; 
		for(var i in input){
			out.push(input[i]);
		}
		return out;
	}
})