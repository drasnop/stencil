/* ----------------    global listeners    ------------------ */


$(document).keyup(function(event) {
   if (event.keyCode == parameters.KEYCODE_ESC) {
      exitCustomizationMode();
      event.stopPropagation();
   }
});


$(window).resize(function() {
   positionHooksAndClusters();
   adjustPanelHeight();
});


/* ----------------    dynamic listeners    ------------------ */


function bindHooksListeners() {

   var hooks = $(".hook");

   // highlight all elements that have the same options as the current one
   hooks.mouseenter(function() {
      haveSameOptions(hooks, $(this).data("options"))
         .addClass("hovered");

      if (experiment.trial) {
         experiment.trial.highlightedHooks.push($(this).data("selector"));
         experiment.trial.highlightedOptions.push(logger.compressOptions($(this).data("options")));
      }
   })

   // remove highlighting for all similar hooks, unless we are leaving a selected hook
   hooks.mouseleave(function() {
      if (!sameElements($(this).data("options"), model.selectedOptions))
         haveSameOptions(hooks, $(this).data("options"))
         .removeClass("hovered")
   })


   // show a panel populated with only the relevant options
   hooks.click(function(event) {

      /*    update model     */

      // Update the content of the panel
      model.selectedOptions = $(this).data("options");

      // Set .selected flag on options
      model.options.forEach(function(option) {
         option.selected = false;
      });
      model.selectedOptions.forEach(function(option) {
         option.selected = true;
      });

      // Compute tab counts
      model.tabs.forEach(function(tab) {
         tab.count = 0;
      })
      model.selectedOptions.forEach(function(option) {
         // a positive value will be treated as true by the filters
         // if the option is hidden in a "more" section, it counts only as half
         option.tab.count += (option.more) ? 0.5 : 1;
      })


      /*    update view     */

      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.resetViewParameters();
      scope.showPanel();
      scope.$apply();

      // remove previous highlighted hooks, if any
      updateHooksHighlighting();

      // position panel next to this anchor
      model.selectedAnchor = $(this);
      positionPanel();

      // log
      if (experiment.trial)
         experiment.trial.selectedOptions.push(logger.compressOptions(model.selectedOptions));
   })


   $("#overlay").click(function() {
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.$apply(scope.closePanel);

      // remove previous highlighted hooks, if any
      updateHooksHighlighting();
   })


   $(".cluster-marker").click(function() {
      var cluster = $(this).data("cluster")

      cluster.showGhosts = !cluster.showGhosts;
      $(this).css("background-image",
         cluster.showGhosts ? "url(//" + parameters.serverURL + "/img/chevron_collapse.png)" : "url(//" + parameters.serverURL + "/img/chevron_expand.png)")
      updateGhostsVisibility(cluster.ghosts, cluster.showGhosts);
      positionHooksAndClusters();
   })
}
