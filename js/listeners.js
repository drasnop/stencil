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
         experiment.trial.highlightedOptions.push(logger.getIDs($(this).data("options")));
      }
   })

   // remove highlighting for all similar hooks, unless we are leaving a selected hook
   hooks.mouseleave(function() {
      if (!sameElements($(this).data("options"), model.selectedOptions))
         haveSameOptions(hooks, $(this).data("options"))
         .removeClass("hovered")
   })


   // show a panel populated with only the relevant options
   hooks.click(function() {
      console.log("click ", this)

      /* check for re-click on the same hook */

      var scope = angular.element($("#ad-hoc-panel")).scope();
      if (model.showPanel && model.selectedAnchor[0] === this) {
         scope.closePanel();
         scope.$apply();
         return;
      }

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
      model.tabs.forEachNonBloat(function(tab) {
         tab.count = 0;
      })
      model.selectedOptions.forEach(function(option) {
         // a positive value will be treated as true by the filters
         // if the option is hidden in a "more" section, it counts only as half
         option.tab.count += (option.more) ? 0.5 : 1;
      })


      /*    update view     */

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
         experiment.trial.selectedOptions.push(logger.getIDs(model.selectedOptions));
   })


   $("#overlay").click(function() {
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.$apply(scope.closePanel);

      // remove previous highlighted hooks, if any
      updateHooksHighlighting();
   })
}


function bindClustersListeners() {
   $(".cluster-marker").click(function() {
      var cluster = $(this).data("cluster")

      // toggle the cluster mark 
      cluster.showGhosts = !cluster.showGhosts;
      $(this).css("background-image",
         cluster.showGhosts ? "url(//" + parameters.serverURL + "/img/chevron_collapse.png)" : "url(//" + parameters.serverURL + "/img/chevron_expand.png)")

      // update its ghosts, with animation
      updateGhostsVisibility(cluster.ghosts, cluster.showGhosts, true);
      positionHooksAndClusters();
   })
}
