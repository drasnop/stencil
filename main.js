console.log("jQuery version: ", jQuery.fn.jquery)

// I don't understand why jQuery is not associated with $...
$=jQuery;

var customizableElementsSelectors = [
	".taskItem-star .icon.task-starred",
	".taskItem-star .wundercon.starred",
	".taskItem-checkboxWrapper .checkBox",
	".filters-collection .sidebarItem a .title",
	".stream-counts",
	".actionBar"
];

var customizableElements = $(customizableElementsSelectors.join());

var customizationModeOn;
var hooks;

if(customizationModeOn === undefined){
	customizationModeOn=true;
	$("body").append("<div id='overlay'></div>");

	// stores the current coordinates
	customizableElements.each(function(){
		$(this).data("coordinates",$(this).offset());
	})

	// clone with their data, but remove event binders with .off()
	hooks=customizableElements.clone(true).off();
	hooks.appendTo("body");

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
	customizationModeOn=undefined;
	$("#overlay").remove();
	hooks.remove();
	//$(customizableElements.join()).removeClass("customizable");
}