javascript:(function(e,a,g,h,f,c,b,d){
	if(!(f=e.jQuery)||g>f.fn.jquery||h(f)){
		console.log("fetching jQuery "+g);
		c=a.createElement("script");
		c.type="text/javascript";
		c.src="https://ajax.googleapis.com/ajax/libs/jquery/"+g+"/jquery.min.js";
		c.onload=c.onreadystatechange=function(){
			if(!b&&(!(d=this.readyState)||d=="loaded"||d=="complete")){
				h((f=e.jQuery).noConflict(1),b=1);
				f(c).remove()
			}
		};
		a.documentElement.childNodes[0].appendChild(c);
	}else{
		console.log("jQuery ",g,"already present")
	}
})(window,document,"2.1.0",function(j,L){
	window.jQuery=j;
	window.$=window.jQuery;

	if ($("link[href='//localhost:8888/style.css']").length>0)
		$("link[href='//localhost:8888/style.css']").remove();

	$('<link/>', {
		rel: 'stylesheet',
		type: 'text/css',
		crossorigin: 'anonymous',
		href: '//localhost:8888/style.css'
	}).appendTo('head');

	$.when(
		$.getScript("//localhost:8888/data.js"),
		$.getScript("//localhost:8888/libs/jquery.popupoverlay.js"),
		$.getScript("//localhost:8888/main.js"),
		$.Deferred(function( deferred ){
			$( deferred.resolve );
		})
	).done(function(){
		enterCustomizationMode();
	});
});