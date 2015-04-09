/* ----------------    global listeners    ------------------ */


$(document).keyup(function(event) {
   if(event.keyCode == parameters.KEYCODE_ESC) {
      exitCustomizationMode();
      event.stopPropagation();
   }
});


$(window).resize(function(){
   positionHooksAndClusters();
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

      // cleanup the selectedOptions to empty the panel and have entrance animations in ng-repeat
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.$apply(scope.prepareEphemeralAnimation);

      // update the content of the panel
      // deep copy in place of the selectedOptions, otherwise we would loose the pointer in angular model.selectedOptions
      angular.copy($(this).data("options"), model.selectedOptions)
      scope.$apply(scope.showPanel);

      // remove previous highlighted hooks, if any
      updateHooksHighlighting();

      // update the position of the panel
      var that = $(this);
      $("#ad-hoc-panel").position({
         my: "left+20 top",
         at: "right top",
         of: that,
         collision: "fit fit",
         using: function(obj, info) {

            //console.log(obj, info)

            $(this).css({
               "left": obj.left + 10 + 'px',
               "top": obj.top + 'px'
            });
         }
      })
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