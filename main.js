var mapping = [
	{
		"selector":".addTask",
		"option":"shortcut_add_new_task",
		"values":""
	},
	{
		"selector":	".taskItem-star .icon.task-starred, "+
					".taskItem-star .wundercon.starred, "+
					".detail-star .icon.detail-starred, "+
					".detail-star .wundercon.starred",
		"option":"shortcut_mark_task_starred",
		"values":""
	},
	{
		"selector":	".taskItem-duedate, "+
					".detail-date .token_0",
		"option":"date_format",
		"values":"DD.MM.YYYY"
	},
	
	{
		"selector":	".detail-checkbox .checkBox, "+
					".taskItem-checkboxWrapper .checkBox",
		"option":"shortcut_mark_task_done",
		"values":""
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a .title",
		"option":"",
		"values":""
	},
	{
		"selector":	"#main-toolbar .wundercon.bell-medium, "+
					".detail-reminder .wundercon.reminder",
		"option":"notifications",
		"values":""
	},
	{
		"selector":"#main-toolbar .wundercon.search",
		"option":"shortcut_goto_search",
		"values":""
	},
	{
		"selector":".sidebarActions-addList",
		"option":"shortcut_add_new_list",
		"values":""
	},
	{
		"selector":".actionBar-bottom div.tab.more",
		"option":"",
		"values":""
	},
	{
		"selector":".detail-trash .wundercon.trash",
		"option":"shortcut_delete",
		"values":""
	}
];
var KEYCODE_ESC = 27,
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

	$("body").children().addClass("dimmed");
	$("body").append("<div id='overlay'></div>");
	/*$("#overlay").css("opacity",".4");   transitions are too slow, alas*/
	// super annoying workaround because of the way they defined the background image
	$("head").append("<style id='special-style'> #wunderlist-base::before{"+
	"-webkit-filter: grayscale(70%); filter: grayscale(70%);} </style>");


	/*-------- create hooks --------*/

	$("body").append("<div id='hooks'></div>");

	// store the current coordinates
	var customizable;
	mapping.forEach(function(m){
		customizable=$(m.selector);

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
			.css({
				"left":$(this).data("coordinates").left+"px",
				"top":$(this).data("coordinates").top+"px"
			})
			.data("option",m.option);

			$(this).find("*").each(function(){
				$(this)
				.css($(this).data("style"))
				.attr('disabled', 'disabled')
				.addClass("customizable-children");
			});
		})
		hooks.addClass("customizable");
		hooks.hover(function(){
			console.log($(".customizable[data-option='"+$(this).data("option")+"']").length);
			$(".customizable").filterByData("option",$(this).data("option")).toggleClass("hovered");
		})
	});


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
				"border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
				"box-sizing","width", "height","display",
				"text-align","font-size"];

var childrenCSS=["padding-top", "padding-right", "padding-bottom", "padding-left",
				"border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
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

// the data attribute will not be updated in the DOM if it is changed dynamically
$.fn.filterByData = function(prop, val) {
    return this.filter(
        function() { return $(this).data(prop)==val; }
    );
}