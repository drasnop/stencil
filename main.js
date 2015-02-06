$(document).keyup(function(e) {
	if (e.keyCode == KEYCODE_ESC) {
        exitCustomizationMode();
	}
});


function initialize(){
	customizationMode=false;

	/*--------	create customization panels	--------*/

	$("body").append("<div id='panels'></div>");
	$("#panels").append("<div id='ad-hoc-panel' ad-hoc-panel></div>")

	angular.module('myApp', [])
	.controller('optionsController', ['$scope', function ($scope) {
		$scope.options = options;
		$scope.updateOption=function(id,value){
			console.log("updating:",id,value)
			sync.collections.settings.where({key:id})[0].set({value:value})
		}
	}])
	.directive('adHocPanel', ['$sce', function($sce) {
		return {
			// need trustAsResourceUrl since we're loading from another domain
			templateUrl: $sce.trustAsResourceUrl('//localhost:8888/ad-hoc-panel.html')
		};
	}])
	.filter('filterOptions', function(){
		return function(input,selectedOptions){
			var output = {};
			$.each(input, function(name,option){
				for(var i in selectedOptions){
					if(selectedOptions[i] == name)
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

function initializeOptions(){
	for(var id in options){
		options[id].value=sync.collections.settings.where({key:id})[0].get("value");
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


function enterCustomizationMode(){
	customizationMode=true;
	console.log("customization mode on");
	initializeOptions();
	
	/*------- dim the background --------*/

	$("body").children(":not(#panels)").addClass("dimmed");
	$("body").append("<div id='overlay'></div>");
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
		hooks.hover(function(){
			haveCommonOption($(".customizable"),$(this).data("options")).toggleClass("hovered");
		})

		// show a panel populated with only the relevant options
		hooks.click(function(event) {
			
			var scope=angular.element(document).scope();
			scope.selectedOptions=$(this).data("options");
			scope.$apply();

			var that = $(this);

			$("#ad-hoc-panel").show()
			$("#ad-hoc-panel").position({
				my: "left+20 top",
				at: "right top",
				of: that,
				collision: "fit fit",
				using: function(obj,info){

					console.log(obj, info)

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


function exitCustomizationMode(){
	customizationMode=false;
	console.log("customization mode off")
	$("#overlay, #hooks, #show-full-panel").remove();
	$("#special-style").remove();
	$("body").children().removeClass("dimmed");
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
function haveCommonOption(input, options) {
	return input.filter(function(){
		var intersection=
		$(this).data("options").filter(function(n){
			return options.indexOf(n) != -1;
		});
		return intersection.length>0;
	})
}