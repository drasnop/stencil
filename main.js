console.log("jQuery version: ", jQuery.fn.jquery)

// I don't understand why jQuery is not associated with $...
$=jQuery;

var customizableElementsSelectors = [
	".taskItem-star .icon.task-starred",
	".taskItem-star .wundercon.starred",
	".taskItem-checkboxWrapper .checkBox",
	".filters-collection .sidebarItem a .title",
	".wundercon.bell-medium",
	"div.tab.more"
];

var customizableElements = $(customizableElementsSelectors.join());

var customizationModeOn;
var hooks;

if(customizationModeOn === undefined){
	console.log("customization mode on");
	customizationModeOn=true;
	
	// wrap the content of the webpage in a div
	$("body").children().wrapAll("<div id='webpage-body'></div>");
	$("#webpage-body")
		.css(getAllCSS($("body")))
		.css("overflow","visible")
		.addClass("dimmed")

	// super annoying workaround because of the way they defined the background image
	$("head").append("<style id='special-style'> #wunderlist-base::before{"+
	"-webkit-filter: grayscale(70%); filter: grayscale(70%);} </style>");

	// add some structure for the customization mode
	$("body").append("<div id='overlay'></div>");
	$("body").append("<div id='hooks'></div>");

	// store the current coordinates
	customizableElements.each(function(){
		$(this).data("coordinates",$(this).offset());
	})

	// clone with their data, but remove event binders with .off()
	hooks=customizableElements.clone(true).off();
	hooks.appendTo("#hooks");

	// position the hooks on top of the elements
	hooks.each(function(){
		//$(this).offset($(this).data("coordinates")); doesn't work
		$(this).removeAttr('style')
		.css({
			"left":$(this).data("coordinates").left+"px",
			"top":$(this).data("coordinates").top+"px"
		});
	})

	hooks.addClass("customizable");
}
else{
	console.log("customization mode off")
	customizationModeOn=undefined;
	hooks.remove();
	$("#overlay, #hooks").remove();
	$("#special-style").remove();
	$("#webpage-body").contents().unwrap();
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
        for (i in css) {
            var l = css[i].split(": ");
            s[l[0].toLowerCase()] = (l[1]);
        }
    }
    return s;
}