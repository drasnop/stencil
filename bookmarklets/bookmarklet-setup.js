javascript:(function(e,a,g,h,f,c,b,d){
	if(!(f=e.jQuery)||g>f.fn.jquery||h(f)){
		console.log('fetching jQuery '+g);
		c=a.createElement('script');
		c.type='text/javascript';
		c.src='https://ajax.googleapis.com/ajax/libs/jquery/'+g+'/jquery.min.js';
		c.onload=c.onreadystatechange=function(){
			if(!b&&(!(d=this.readyState)||d=='loaded'||d=='complete')){
				h((f=e.jQuery).noConflict(1),b=1);
				f(c).remove()
			}
		};
		a.documentElement.childNodes[0].appendChild(c);
	}else{
		console.log('jQuery ',g,'already present')
	}
})(window,document,'2.1.0',function(j,L){
	window.jQuery=j;
	window.$=window.jQuery;

	var serverURL='localhost:8888';
	/*var serverURL='cs.ubc.ca/~aponsard/stencil';*/

	$('<link/>', {
		rel: 'stylesheet',
		type: 'text/css',
		crossorigin: 'anonymous',
		href: '//' + serverURL + '/css/bootstrap.css'
	}).appendTo('head');
	$('<link/>', {
		rel: 'stylesheet',
		type: 'text/css',
		crossorigin: 'anonymous',
		href: '//' + serverURL + '/css/style.css'
	}).appendTo('head');

	$.when(
		$.getScript('//ajax.googleapis.com/ajax/libs/angularjs/1.3.11/angular.js'),
		$.Deferred(function( deferred ){
			$( deferred.resolve );
		})
	).done(function(){
		$.when(
			$.getScript('//ajax.googleapis.com/ajax/libs/angularjs/1.3.11/angular-animate.js'),
			$.getScript('//ajax.googleapis.com/ajax/libs/angularjs/1.3.11/angular-sanitize.js'),
			$.Deferred(function( deferred ){
				$( deferred.resolve );
			})
		).done(function(){
			$.when(
				$.getScript('//' + serverURL + '/libs/jquery-ui-position.js'),
				$.getScript('//' + serverURL + '/libs/bootstrap.js'),
				$.getScript('//' + serverURL + '/js/global.js'),
				$.getScript('//' + serverURL + '/js/sequencer.js'),
				$.getScript('//' + serverURL + '/js/tutorial.js'),
				$.getScript('//' + serverURL + '/js/experiment.js'),
				$.getScript('//' + serverURL + '/js/geometry.js'),
				$.getScript('//' + serverURL + '/js/dataManager.js'),
				$.getScript('//' + serverURL + '/js/app.js'),
				$.getScript('//' + serverURL + '/js/controllers.js'),
				$.getScript('//' + serverURL + '/js/listeners.js'),
				$.getScript('//' + serverURL + '/js/hooks.js'),
				$.getScript('//' + serverURL + '/js/helpers.js'),
				$.getScript('//' + serverURL + '/js/main.js'),
				$.Deferred(function( deferred ){
					$( deferred.resolve );
				})
			).done(function(){
				initialize();
			})
		})
	});
});