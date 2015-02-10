/*global global:true*/
var global={
	"selectedOptions":[],
};

function initialize(){
	customizationMode=false;

	/*--------	create customization panels	--------*/

	$("body").append("<div id='panels'></div>");
	$("#panels").append("<div id='ad-hoc-panel' ng-controller='optionsController' ad-hoc-panel></div>")

	angular.module('myApp', [])
	.controller('optionsController', ['$scope','$window', function ($scope, $window) {
		$scope.options=$window.options;

		// 0=minimum, 1=linked, 2=highlighted
		$scope.optionsVisibility=0;

		$scope.updateOption=function(id,value){
			console.log("updating:",id,value)
			sync.collections.settings.where({key:id})[0].set({value:value})
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

	angular.element(document).ready(function() {
		console.log("Bootstrapping Angular");
		angular.bootstrap(document, ['myApp']);
	});
}


function enterCustomizationMode(){
	customizationMode=true;
	console.log("customization mode on");
	initializeOptions();

	/*------- dim the background --------*/

	$("body").children(":not(#panels)").addClass("dimmed");
	$("body").append("<div id='overlay'></div>");
	$("#panels").show(); //TODO: remove them, and try to recreate popup in enterCM()
	/*$("#overlay").css("opacity",".4");   transitions are too slow, alas*/
	// super annoying workaround because of the way they defined the background image
	$("head").append("<style id='special-style'> #wunderlist-base::before{"+
		"-webkit-filter: grayscale(70%); filter: grayscale(70%);} </style>");


	/*-------- create hooks --------*/

	$("body").append("<div id='hooks'></div>");

	// store the current coordinates
	var customizable, hooks;
	mapping.forEach(function(m){
		customizable=$(m.selector);

		if(customizable.length===0)
			console.log(m.selector,"failed to match any element for",m.options)

		customizable.each(function(){
			$(this).data("coordinates", $(this).offset());
			$(this).data("style", getRelevantCSS($(this),parentCSS));
		})
		customizable.find("*").each(function(){
			$(this).data("style", getRelevantCSS($(this),childrenCSS));
		})

		// clone with their data, but remove event binders with .off()
		hooks=customizable.clone(true).off();
		hooks.appendTo("#hooks");

		// position the hooks on top of the elements
		hooks.each(function(){
			//$(this).offset($(this).data("coordinates")); doesn't work
			$(this)
			.css($(this).data("style"))
			.attr('disabled', 'disabled')
			.removeAttr('href')
			.css({
				"left":$(this).data("coordinates").left+"px",
				"top":$(this).data("coordinates").top+"px"
			})
			.data("options",m.options);

			$(this).find("*").each(function(){
				$(this)
				.css($(this).data("style"))
				.attr('disabled', 'disabled')
				.removeAttr('href')
				.addClass("customizable-children");
			});
		})
		hooks.addClass("customizable");
		

		// highlight all elements that share at least one option with the current one
		hooks.mouseenter(function(){
			filterByCommonOption($(".customizable"),$(this).data("options")).addClass("hovered");
		})

		hooks.mouseleave(function(){
			if(!nonZeroIntersection($(this).data("options"),global.selectedOptions))
				filterByCommonOption($(".customizable"),$(this).data("options")).removeClass("hovered");
		})

		// show a panel populated with only the relevant options
		hooks.click(function(event) {
			
			// update the contenct of the panel
			global.selectedOptions=$(this).data("options");
			angular.element(document).scope().$apply();

			// remove previous highlighted hooks, if any
			$(".customizable").each(function(){
				if(!nonZeroIntersection($(this).data("options"),global.selectedOptions))
					filterByCommonOption($(".customizable"),$(this).data("options")).removeClass("hovered");
			})

			// update the position of the panel
			var that = $(this);
			$("#ad-hoc-panel").show()
			$("#ad-hoc-panel").position({
				my: "left+20 top",
				at: "right top",
				of: that,
				collision: "fit fit",
				using: function(obj,info){

					// console.log(obj, info)

					$(this).css({
						left: obj.left + 'px',
						top: obj.top + 'px'
					});
				}
			})
		})

	});

$("#overlay").click(function(){
	$("#ad-hoc-panel").hide();
	global.selectedOptions=[];
	$(".customizable").removeClass("hovered");
})

$("#panels").append("<a id='show-full-panel'>Other settings...</a>")


/*	$("#ad-hoc-panel").popup({
		type: "tooltip",
		openelement: ".customizable",
		horizontal: "right",
		vertical: "center",
		offsetleft: 10
	})*/
}


///////////		Secondary functions		////////////////////


$(document).keyup(function(e) {
	if (e.keyCode == KEYCODE_ESC) {
		exitCustomizationMode();
	}
});

function initializeOptions(){
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
	// notify angular that the current values of options have changed
	angular.element(document).scope().$apply();
}

function toggleCustomizationMode(){
	if(customizationMode===undefined)
		return;

	if(!customizationMode)
		enterCustomizationMode();
	else
		exitCustomizationMode();
}

function toggleOptionsVisibility(){
	var scope=angular.element($("#ad-hoc-panel")).scope();
	scope.optionsVisibility= (scope.optionsVisibility+1)%3;
	console.log("scope.optionsVisibility",scope.optionsVisibility);
	scope.$apply();
}

function exitCustomizationMode(){
	customizationMode=false;
	console.log("customization mode off")
	$("#overlay, #hooks, #show-full-panel").remove();
	$("#special-style").remove();
	$("body").children().removeClass("dimmed");

	$("#panels").hide(); //TODO: remove them, and try to recreate popup in enterCM()
}



///////////		helper functions		////////////////////



var parentCSS=["padding-top", "padding-right", "padding-bottom", "padding-left",
"border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
"margin-top", "margin-right", "margin-bottom", "margin-left",
"box-sizing","width", "height","display","float",
"text-align","font-size"];

var childrenCSS=["padding-top", "padding-right", "padding-bottom", "padding-left",
"border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
"margin-top", "margin-right", "margin-bottom", "margin-left",
"position","top", "right", "bottom", "left",
"box-sizing","width", "height","display","float",
"text-align","font-size"];

function getRelevantCSS(obj, relevantCSS) {
	var rules={};
	for(var i in relevantCSS){
		rules[relevantCSS[i]] = obj.css(relevantCSS[i]);
	}
	return rules;
}

// return the objects that have at least one option in common with the ones passed in argument
function filterByCommonOption(input, options) {
	return input.filter(function(){
		return nonZeroIntersection($(this).data("options"), options)
	});
}

// returns true if arrays a and b have at least one element in common
function nonZeroIntersection(a, b){
	var intersection=
	a.filter(function(element){
		return b.indexOf(element) != -1;
	});
	return intersection.length>0;
}