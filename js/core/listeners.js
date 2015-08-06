/*
 * Listeners for Esc key, resizing window, hovering and clicking on hooks, clicking on clusters
 */

var listeners = (function() {
   var listeners = {};


   /* ----------------    global listeners    ------------------ */

   listeners.bindGlobalListeners = function() {

      $(document).keyup(function(event) {
         if (event.keyCode == parameters.KEYCODE_ESC) {
            exitCustomizationMode();
            event.stopPropagation();
         }
      });

      $(window).resize(function() {
         hooksManager.positionHooksAndClusters();
         // adjustPanelHeight();
         positionPanel();
      });
   }


   /* ----------------    dynamic listeners    ------------------ */

   listeners.bindHooksListeners = function() {

      var hooks = $(".hook");

      // highlight all elements that have the same options as the current one
      hooks.mouseenter(function() {
         haveSameOptions(hooks, $(this).data("options"))
            .addClass("hovered");

         if (experiment.sequencer.trial) {
            experiment.sequencer.trial.highlightedHooks.pushStamped({
               "selector": $(this).data("selector"),
               "options_IDs": logger.getIDs($(this).data("options"))
            });
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

         // revert to contracted panel, if needed
         model.panelExpanded = false;

         // cleanup the visible options, to allow the entrance animation to play again
         view.resetVisibleOptions();

         scope.showPanel();

         // update the index of visible options, which will play ephemeral animation in full panel
         view.positionAllOptions();
         scope.$apply();

         // change width and height of panel
         scope.resizePanel();

         // remove previous highlighted hooks, if any
         hooksManager.updateHooksHighlighting();

         // position panel next to this anchor
         model.selectedAnchor = $(this);
         positionPanel();

         // log
         if (experiment.sequencer.trial) {
            experiment.sequencer.trial.selectedHooks.pushStamped({
               "selector": $(this).data("selector"),
               "options_IDs": logger.getIDs(model.selectedOptions)
            });
         }
      })

   }


   listeners.bindClustersListeners = function() {
      $(".cluster-marker").off("click").click(function() {
         var cluster = $(this).data("cluster")

         // toggle the cluster mark 
         cluster.showGhosts = !cluster.showGhosts;
         $(this).css("background-image",
            cluster.showGhosts ? "url(//" + parameters.serverURL + "/img/chevron_collapse.png)" : "url(//" + parameters.serverURL + "/img/chevron_expand.png)")

         // update its ghosts, with animation
         hooksManager.updateGhostsVisibility(cluster.ghosts, cluster.showGhosts, true);
         hooksManager.positionHooksAndClusters();

         // log
         if (experiment.sequencer.trial) {
            experiment.sequencer.trial.cluster.pushStamped({
               "action": (cluster.showGhosts ? "expanded" : "contracted")
            })
         }
      })
   }


   // Resize the panel to create a vertical scrollbar instead of overflowing
   function adjustPanelHeight() {

      // Do not reposition minimal panel; simply reposition it
      if (!model.fullPanel()) {
         positionPanel();
         return;
      }

      // we leave a margin of 30px below the panel
      var wh = window.innerHeight - 30;
      var top = $("#ad-hoc-panel").offset().top;

      $("#options-list").css("height", "");
      // we want to keep the tabs always visible, so resize only the options list
      if (top + $("#ad-hoc-panel").height() > wh) {
         $("#options-list").height(wh - top - $("#tabs").height());


         if ($("#ad-hoc-panel").offset().top < 30) {
            $("#ad-hoc-panel").offset({
               "top": 30
            });
            $("#options-list").height(wh - $("#ad-hoc-panel").offset().top - $("#tabs").height());
         }
      }

      //console.log("after adjustPanelHeight", $("#ad-hoc-panel").offset().top, $("#options-list").height())
   }

   return listeners;
})();
