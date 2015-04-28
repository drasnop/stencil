/*
generateHooks()
   # init
   - create all hooks [so far hooks are never distroyed]
   - disable them, add proper css

updateHooksStatus()
   # init + when the status (visible/hidden) of a hook changes
   - add/remove .ghost class
   - updateGhostsVisibility
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
-> bindHooksListeners()

** expand/collapse cluster
updateGhostVisibility(cluster)
[all hooks] positionHooks([showGhosts]) -> [all clusters] positionClusters()

** change of status [showGhosts]
updateHooksStatus() -> [all hooks] positionHooks([showGhosts]) -> generateClusters() -> [all clusters] positionClusters()
-> bindHooksListeners()

*/


/* ----------------    public    ------------------ */


function updateHooksAndClusters(){
   updateHooksStatus();
   positionHooks();
   generateClusters();
   positionClusters();
   bindHooksListeners();
}


function positionHooksAndClusters(){
   positionHooks();
   positionClusters();
}


/* ----------------    hooks    ------------------ */



function generateHooks() {
   // elements of the original interface that can serve to anchor (intrinsically or semantically) options
   var mapping_anchors;

   // for each selector-options pairs, generate the appropriate hooks
   model.mappings.forEach(function(mapping) {

      mapping_anchors = $(mapping.selector);
      if(mapping_anchors.length === 0)
         console.log(mapping.selector, "failed to match any element for", mapping.options)


      var hook;
      mapping_anchors.each(function(i, anchor) {

         // store the style of this anchor and its children
         $(anchor).find("*").addBack().each(function() {
            $(this).data("style", getRelevantCSS($(this), parentCSS))
         })

         // deep clone anchor, with data (for style), but remove event binders with .off()
         hook = $(anchor).clone(true, true).off();
         hook.appendTo("#hooks");
         hook.data("anchor", $(anchor));

         // associate options (themselves) to hook
         hook.data("options", mapping.options.map(function(option_id){
            return model.options[option_id];
         }));

         // make sure the hook and its children are not active
         hook.find("*").addBack()
            .removeAttr('href')
            .removeClass('animate-up')
         // alas, there seem to be no way to disable an <input> while binding my own events on it...

         // style hook and its children
         hook.addClass("hook").addClass("highlightable")
         hook.find("*").addBack().each(function() {
            $(this).css($(this).data("style"))
         })
      })

   });

   if(model.gmail)
      gmailSpecific();
}


function gmailSpecific(){
   $("#hooks").append("<div id='y6-y2'></div>")

   $("#y6-y2").width($(".y6").offset().left + $(".y6").width())

   $(".hook.y2").appendTo("#y6-y2");
}


function updateHooksStatus() {
   // clones of the anchors with which users interact in customization mode
   var hooks = $(".hook");

   hooks.each(function(i, hookElement) {
      var hook = $(hookElement)

      // check if one option associated with this hook is a show/hide of type hidden
      var ghost = false;
      hook.data("options").forEach(function(option) {
         if(typeof option.hideable !== "undefined" && option.hideable && option.value.name == "hidden")
            ghost = true;
      });
      hook.data("ghost", ghost)

      // add or remove .ghost 
      hook.toggleClass("ghost", ghost)

      // ghosts are hidden by default, non-ghosts are always visible
      // TODO When setting an item visible, don't hide ghosts from the same cluster (if any)
      // TODO When setting an item hidden, don't hide it (=force showGhosts of the cluster it now belongs to)
      // TODO When modifying an item, don't hide/change ghosts from other clusters, if those are preserved
      updateGhostsVisibility([hook], !ghost)
   });
}

// @param Array of jQuery Objects
function updateGhostsVisibility(ghosts, show) {
   ghosts.forEach(function(ghost) {
      ghost.data("anchor").toggle(show);
/*      ghost.toggle(show);*/
      if(show)
         ghost.slideDown(400, "linear");
      else
         ghost.slideUp(600, "linear");
   })
}


function positionHooks() {
   $(".hook").each(function(i, hook) {
      computeHookPosition($(hook));
   })
}


function computeHookPosition(hook) {
   // ghost are by default hidden, so we must account for that
   var ghost = hook.data("ghost");
   // however, if a ghost anchor has explicitely been set visible, don't touch it
   if(ghost && hook.data("anchor").css("display") != "none")
      ghost = false;

   // briefly show the original anchor to measure its position
   if(ghost)
      hook.data("anchor").show()

   // set the position of this hook (even if it's hidden), from the original anchor's position
   // we take the regular ("content") width and height, because we will force hooks to content-box
   var position={
      "top": hook.data("anchor").offset().top + "px",
      "left": hook.data("anchor").offset().left + "px",
      "width": hook.data("anchor").width()  + "px",
      "height": hook.data("anchor").height() + "px"
   }

   hook.css(position)

   // store the position so that the cluster algorithm can access it without waiting for the end of the animation
   hook.data("position",position)

   // hide the original anchor again
   if(ghost)
      hook.data("anchor").hide()
}


function updateHooksHighlighting(){
   var hooks=$(".hook");
   hooks.each(function() {
      dontHaveSameOptions(hooks, model.selectedOptions).removeClass("hovered");   
   })
}


/* ----------------    clusters    ------------------ */




function generateClusters() {

   // delete previous clusters
   $("#hooks .plus-icon").remove();

   // list of all the hooks that are currently hidden
   var ghosts = $(".ghost").toArray();
   // groups of ghost hooks that are near each other
   model.clusters = [];

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

      // for the moment
      cluster.showGhosts = false;

      model.clusters.push(cluster);
   }

   // Create one plus icon per cluster (even if it contains only one elements)
   model.clusters.forEach(function(cluster) {
      var icon = $("<div class='plus-icon'>").appendTo("#hooks")
      .css("background-image","url(//" + parameters.serverURL + "/img/plus_blue.png)")

      icon.data("cluster", cluster);
      cluster.icon=icon;

      // allow the plus-icon to be reverse highlighted if one of the options it represents is
      icon.addClass("highlightable")
      .data("options", cluster.ghosts.reduce(function(options, ghost){
         return options.concat(ghost.data("options"));
      }, []))
   })
}


function positionClusters() {
   model.clusters.forEach(function(cluster) {
      positionCluster(cluster)
   })
}


function positionCluster(cluster) {
   
   // compute barycenter
   cluster.x = Math.mean(cluster.ghosts.map(function(ghost) {
      return parseInt(ghost.data("position").left) + parseInt(ghost.data("position").width)  / 2;
   }))
   cluster.y = Math.mean(cluster.ghosts.map(function(ghost) {
      return parseInt(ghost.data("position").top) + parseInt(ghost.data("position").height) / 2;
   }))


   var icon = cluster.icon;
   icon.css({
      "left": cluster.x - icon.robustWidth()  / 2 + "px",
      "top": cluster.y - icon.robustHeight() / 2 + "px"
   })
}
