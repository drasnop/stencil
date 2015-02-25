/*
generateHooks()
   # init
   - create all hooks [so far hooks are never distroyed]
   - disable them, add proper css

updateHooksStatus()
   # init + when the status (visible/hidden) of a hook changes
   - add/remove .ghost class
   - updateGhostVisibility
      # init: all ghosts, false
      // # set visible: cluster.ghosts, true (alas, this is a bit complicated because we then should pass a don't generate clusters flag)
      // # set hidden: cluster.ghosts, false (for the moment, because we need to recompute clusters)

updateGhostsVisibility(ghosts, show)
   - for each ghost
      - ghost.toggle(show)
      - anchor.toggle(show)

positionHooks()
   # updateHooks + expand/collapse a cluster [no change of status]
   - compute position by showing hidden hooks one by one (the clusters.ghosts may or may not be visible)

computeHookPosition()
   - if hidden, show then hide anchor to get position
   - if ghost made visible by cluster, then don't touch anchor (treat as normal)


generateClusters()
   # [after] updateHooksStatus
   - generate clusters based on position of hooks

positionClusters()
   # [after] positionHooks
   - update position of clusters

computeClusterPosition()
   - barycenter + apply it


** init sequence
generateHooks()
updateHooksStatus() -> [all hooks] positionHooks([showGhosts]) -> generateClusters() -> [all clusters] positionClusters()

** expand/collapse cluster
updateGhostVisibility(cluster)
[all hooks] positionHooks([showGhosts]) -> [all clusters] positionClusters()

** change of status [showGhosts]
updateHooksStatus() -> [all hooks] positionHooks([showGhosts]) -> generateClusters() -> [all clusters] positionClusters()

*/


function generateHooks() {
   // elements of the original interface that can serve to anchor (intrinsically or semantically) options
   var mapping_anchors;

   // for each selector-options pairs, generate the appropriate hooks
   mappings.forEach(function(mapping) {

      mapping_anchors = $(mapping.selector);
      if(mapping_anchors.length === 0)
         console.log(mapping.selector, "failed to match any element for", mapping.options)

      var hook;
      mapping_anchors.each(function(i, anchor) {

         // deep clone anchor, but remove event binders with .off()
         hook = $(anchor).clone(true).off();
         hook.appendTo("#hooks");
         hook.data("anchor", $(anchor));
         hook.data("options", mapping.options);

         hook.addClass("customizable")

         // make sure the hook and its children are not active
         hook.find("*").addBack()
            .attr('disabled', 'disabled')
            .removeAttr('href')

         // style hook and its children
         /* hook.find("*").addBack().each(function() {
            $(this).css(getRelevantCSS($(this).data("anchor"), parentCSS))
         })*/
         hook.css(getRelevantCSS(hook.data("anchor"), parentCSS))
      })

   });
}



function updateHooks() {

   // clones of the anchors with which users interact in customization mode
   var hooks = $(".customizable");

   hooks.each(function(i, hookElement) {
      var hook = $(hookElement)

      // set top, left, width, height (by displaying INDIVIDUAL anchors if necessary)
      computeHookPosition(hook);

      // TODO remove
      // check if one option associated with this hook is a show/hide of type hidden
      var hidden = false;
      hook.data("options").forEach(function(option_id) {
         if(options[option_id].hideable && options[option_id].value == "hidden")
            hidden = true;
      });

      // manage hidden hooks
      if(hidden) {
         // turn this hook into a ghost
         hook.addClass("ghost");
         hook.toggle(model.showGhosts)
      }
      else {
         // for hooks that have just been de-hidden
         hook.removeClass("ghost")
         hook.show();
      }
   });


   // group the ghosts into clusters (displayed as +) to reduce clutter
   generateClusters()
}



function generateClusters() {

   // delete previous clusters
   $("#hooks .plus-icon").remove();

   // list of all the hooks that are currently hidden
   var ghosts = $(".ghost").toArray();
   // groups of ghost hooks that are near each other
   var clusters = [];

   var ghost, cluster;
   while(ghosts.length > 0) {
      ghost = $(ghosts.pop());
      cluster = {
         "ghosts": [ghost]
      };

      // Add to this cluster all ghosts that are close to ghost
      for(var i = 0; i < ghosts.length; i++) {
         if(distance(ghost, $(ghosts[i])) <= parameters.distance) {
            cluster.ghosts.push($(ghosts.splice(i, 1)[0]));
            i--;
         }
      }

      clusters.push(cluster);
   }

   // Create one plus icon per cluster (even if it contains only one elements)
   clusters.forEach(function(cluster) {
      var icon = $("<img class='plus-icon'>").appendTo("#hooks");
      icon.attr("src",
            model.showGhosts ? "//localhost:8888/img/minus_dark_yellow.png" : "//localhost:8888/img/plus_dark_yellow.png")
         .data("cluster", cluster)

      // compute the position of the cluster
      positionCluster(cluster)
   })
}



function repositionHooksForCluster(cluster, show) {

   // first, we need to show/hide all the anchors corresponding to the ghosts
   cluster.ghosts.forEach(function(ghost) {
      ghost.toggle(show);
      ghost.data("anchor").toggle(show);
   })

   // then we update the position of ALL hooks
   $(".customizable").each(function(i, hook) {
      computeHookPosition($(hook));
   })

   // finaly we reposition the cluster
   positionCluster(cluster)
}


function positionCluster(cluster){
   computeBarycenter(cluster)

   var icon = cluster.icon;
   icon.css({
      "left": cluster.x - icon.width() / 2 + "px",
      "top": cluster.y - icon.height() / 2 + "px"
   })
}


function computeHookPosition(hook) {

   // check if one option associated with this hook is a show/hide of type hidden
   var hidden = false;
   hook.data("options").forEach(function(option_id) {
      if(options[option_id].hideable && options[option_id].value == "hidden")
         hidden = true;
   });

   // however, if a ghost hook has explicitely been set visible, don't touch it
   if(hidden && hook.is(":visible"))
      hidden = false;

   // briefly show the original anchor to measure its position
   if(hidden)
      hook.data("anchor").show()

   // store the original anchor's position information for clustering
   var offset = hook.data("anchor").offset();
   var width = hook.data("anchor").width();
   var height = hook.data("anchor").height();

   // set the position of this hook (even if it's hidden)
   hook.css({
      "top": offset.top + "px",
      "left": offset.left + "px",
      "width": width + "px",
      "height": height + "px"
   })

   // hide the original anchor again
   if(hidden)
      hook.data("anchor").hide()
}



function bindListeners() {

   var hooks = $(".customizable");

   // highlight all elements that share at least one option with the current one
   hooks.mouseenter(function() {
      filterByCommonOption(hooks, $(this).data("options"))
         .addClass("hovered")
   })

   hooks.mouseleave(function() {
      if(!nonZeroIntersection($(this).data("options"), model.selectedOptions))
         filterByCommonOption(hooks, $(this).data("options"))
         .removeClass("hovered")
   })


   // show a panel populated with only the relevant options
   hooks.click(function(event) {

      // update the content of the panel
      // deep copy in place of the selectedOptions, otherwise we would loose the pointer in angular $scope.model.selectedOptions
      angular.copy($(this).data("options"), model.selectedOptions)
      var scope = angular.element($("#ad-hoc-panel")).scope();
      // specific parameters to set
      scope.computeActiveTab();
      scope.resetViewParameters();
      scope.$apply();

      // remove previous highlighted hooks, if any
      hooks.each(function() {
         if(!nonZeroIntersection($(this).data("options"), model.selectedOptions))
            filterByCommonOption(hooks, $(this).data("options")).removeClass("hovered");
      })

      // update the position of the panel
      var that = $(this);
      $("#ad-hoc-panel").show()
      $("#ad-hoc-panel").position({
         my: "left+20 top",
         at: "right top",
         of: that,
         collision: "fit fit",
         using: function(obj, info) {

            // console.log(obj, info)

            $(this).css({
               "left": obj.left + 'px',
               "top": obj.top + 'px'
            });
         }
      })
   })


   $("#overlay").click(function() {
      $("#ad-hoc-panel").hide();
      // just to be sure, cleanup selectedOptions without deleting the array
      model.selectedOptions.length = 0;
      hooks.removeClass("hovered");

      // revert back to the minimal panel    
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.resetViewParameters();
      scope.$apply();
   })


   $(".plus-icon").click(function() {
      model.showGhosts = !model.showGhosts;
      $(this).attr("src",
         model.showGhosts ? "//localhost:8888/img/minus_dark_yellow.png" : "//localhost:8888/img/plus_dark_yellow.png")

      var cluster = $(this).data("cluster")

      repositionHooksForCluster(cluster, model.showGhosts);
   })
}
