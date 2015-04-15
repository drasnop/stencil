/* ----------------    global listeners    ------------------ */


$(document).keyup(function(event) {
   if(event.keyCode == parameters.KEYCODE_ESC) {
      exitCustomizationMode();
      event.stopPropagation();
   }
});


$(window).resize(function(){
   positionHooksAndClusters();
   adjustPanelHeight();
});


/* ----------------    dynamic listeners    ------------------ */


function bindHooksListeners() {

   var hooks = $(".customizable");

   // highlight all elements that share at least one option with the current one
   hooks.mouseenter(function() {
      haveSameOptions(hooks, $(this).data("options"))
         .addClass("hovered")
   })

   // remove highlighting for all similar hooks, unless we are leaving a selected hook
   hooks.mouseleave(function() {
      if(!sameElements($(this).data("options"), model.selectedOptions))
         haveSameOptions(hooks, $(this).data("options"))
         .removeClass("hovered")
   })


   // show a panel populated with only the relevant options
   hooks.click(function(event) {

      model.selectedAnchor=$(this);

      var scope = angular.element($("#ad-hoc-panel")).scope();

      // update the content of the panel
      model.selectedOptions=$(this).data("options");
      
      // set .selected flag on options
      Object.keys(model.options).forEach(function(option_id){
         model.options[option_id].selected=false;
      });
      model.selectedOptions.forEach(function(option){
         option.selected=true;
      });

      // update view
      scope.resetViewParameters();
      scope.showPanel();
      scope.$apply();

      // remove previous highlighted hooks, if any
      updateHooksHighlighting();

      // position panel next to this anchor
      positionPanel();
   })


   $("#overlay").click(function() {
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.$apply(scope.closePanel);

      // remove previous highlighted hooks, if any
      updateHooksHighlighting();
   })


   $(".plus-icon").click(function() {
      var cluster = $(this).data("cluster")

      cluster.showGhosts = !cluster.showGhosts;
      $(this).css("background-image",
         cluster.showGhosts ? "url(//localhost:8888/img/minus_blue.png)" : "url(//localhost:8888/img/plus_blue.png)")
      updateGhostsVisibility(cluster.ghosts, cluster.showGhosts);
      positionHooksAndClusters();
   })
}