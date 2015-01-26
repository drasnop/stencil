var customizableElementsSelectors = [
	".taskItem-star .icon.task-starred",
	".taskItem-star .wundercon.starred",
	".taskItem-checkboxWrapper .checkBox",
	".filters-collection .sidebarItem[aria-hidden=false] a .title",
	".wundercon.bell-medium",
	"div.tab.more"
];
var KEYCODE_ESC = 27,
	customizableElements = $(customizableElementsSelectors.join()),
	hooks;

if(hooks === undefined)
	enterCustomizationMode();
else
	exitCustomizationMode();

$(document).keyup(function(e) {
	if (e.keyCode == KEYCODE_ESC) {
        exitCustomizationMode();
	}
});


function enterCustomizationMode(){
	console.log("customization mode on");
	
	/*------- dim the background --------*/

	$("body").append("<div id='overlay'></div>");
	/*$("#overlay").css("opacity",".4");   transitions are too slow, alas*/
	$("body").children().addClass("dimmed");
	// super annoying workaround because of the way they defined the background image
	$("head").append("<style id='special-style'> #wunderlist-base::before{"+
	"-webkit-filter: grayscale(70%); filter: grayscale(70%);} </style>");


	/*-------- create hooks --------*/

	$("body").append("<div id='hooks'></div>");

	// store the current coordinates
	customizableElements.each(function(){
		$(this).data("coordinates", $(this).offset());
		$(this).data("style", getRelevantCSS($(this),parentCSS));
	})
	customizableElements.find("*").each(function(){
		$(this).data("style", getRelevantCSS($(this),childrenCSS));
	})

	// clone with their data, but remove event binders with .off()
	hooks=customizableElements.clone(true).off();
	hooks.appendTo("#hooks");

	// position the hooks on top of the elements
	hooks.each(function(){
		//$(this).offset($(this).data("coordinates")); doesn't work
		$(this).css($(this).data("style"))
		.css({
			"left":$(this).data("coordinates").left+"px",
			"top":$(this).data("coordinates").top+"px"
		});
		$(this).find("*").each(function(){
			$(this).css($(this).data("style"));
		});
	})
	hooks.addClass("customizable");


	/*--------	create customization panels	--------*/

	$("body").append("<div id='panels'></div>");
	$("#panels").append("<a id='show-full-panel'>Other settings...</a>");
}


function exitCustomizationMode(){
	console.log("customization mode off")
	hooks.remove();
	hooks=undefined;
	$("#overlay, #hooks, #panels").remove();
	$("#special-style").remove();
	$("body").children().removeClass("dimmed");
}



///////////		helper functions		////////////////////

var parentCSS=["padding-top", "padding-right", "padding-bottom", "padding-left",
				"box-sizing","width", "height","display",
				"text-align","font-size"];

var childrenCSS=["padding-top", "padding-right", "padding-bottom", "padding-left",
				"margin-top", "margin-right", "margin-bottom", "margin-left",
				"box-sizing","width", "height","display",
				"text-align","font-size"];

function getRelevantCSS(obj, relevantCSS) {
	var rules={};
	for(var i in relevantCSS){
		rules[relevantCSS[i]] = obj.css(relevantCSS[i]);
	}
	return rules;
}

function getAllCSS(a) {
    var sheets = document.styleSheets, o = {};
    for (var i in sheets) {
        var rules = sheets[i].rules || sheets[i].cssRules;
        for (var r in rules) {
            if (a.is(rules[r].selectorText)) {
                o = $.extend(o, css2json(rules[r].style), css2json(a.attr('style')));
            }
        }
    }
    return o;
}

function css2json(css) {
    var s = {};
    if (!css) return s;
    if (css instanceof CSSStyleDeclaration) {
        for (var i in css) {
            if ((css[i]).toLowerCase) {
                s[(css[i]).toLowerCase()] = (css[css[i]]);
            }
        }
    } else if (typeof css == "string") {
        css = css.split("; ");
        for (var i in css) {
            var l = css[i].split(": ");
            s[l[0].toLowerCase()] = (l[1]);
        }
    }
    return s;
}