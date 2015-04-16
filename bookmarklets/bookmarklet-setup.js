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

	if ($("link[href='//localhost:8888/css/style.css']").length>0)
		$("link[href='//localhost:8888/css/style.css']").remove();

	$('<link/>', {
		rel: 'stylesheet',
		type: 'text/css',
		crossorigin: 'anonymous',
		href: '//localhost:8888/css/style.css'
	}).appendTo('head');

	$.when(
		$.getScript("//ajax.googleapis.com/ajax/libs/angularjs/1.3.11/angular.js"),
		$.Deferred(function( deferred ){
			$( deferred.resolve );
		})
	).done(function(){
		$.when(
			$.getScript("//ajax.googleapis.com/ajax/libs/angularjs/1.3.11/angular-animate.js"),
			$.Deferred(function( deferred ){
				$( deferred.resolve );
			})
		).done(function(){
			$.when(
				$.getScript("//localhost:8888/libs/jquery-ui-position.js"),
				$.getScript("//localhost:8888/js/global.js"),
				$.getScript("//localhost:8888/js/geometry.js"),
				$.getScript("//localhost:8888/js/dataManager.js"),
				$.getScript("//localhost:8888/js/app.js"),
				$.getScript("//localhost:8888/js/controller.js"),
				$.getScript("//localhost:8888/js/listeners.js"),
				$.getScript("//localhost:8888/js/hooks.js"),
				$.getScript("//localhost:8888/js/helpers.js"),
				$.getScript("//localhost:8888/js/main.js"),
				$.Deferred(function( deferred ){
					$( deferred.resolve );
				})
			).done(function(){
				initialize();
			})
		})
	});
});