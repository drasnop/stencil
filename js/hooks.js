// list of all the hooks that are currently hidden
ghosts = [];

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
      })

   });
}



function updateHooks() {

   var hooks = $(".customizable");
   ghosts = [];

   hooks.each(function(i, hookElement) {
      var hook = $(hookElement)
      var anchor = hook.data("anchor")

      // style hook and its children
      /*      hook.find("*").addBack().each(function() {
               $(this).css(getRelevantCSS($(this).data("anchor"), parentCSS))
            })*/
      hook.css(getRelevantCSS(anchor, parentCSS))

      // check if one option associated with this selector is a show/hide of type hidden
      var hidden = false;
      hook.data("options").forEach(function(option_id) {
         if(options[option_id].hideable && options[option_id].value == "hidden")
            hidden = true;
      });

      // retrieve position information of the original anchor
      var offset, width, height;
      if(hidden) {
         // briefly show the original anchor to measure its position
         anchor.css("transition", "none!important")
         anchor.removeClass("animate-up")
      }

      // store this particular anchor's position for clustering
      offset = anchor.offset();
      width = anchor.width();
      height = anchor.height();

      if(hidden) {
         // hide the original anchor again
         anchor.addClass("animate-up");
         // TODO add transitions back
      }

      // set the position of this hook (even if it's hidden)
      hook.css({
         "top": offset.top + "px",
         "left": offset.left + "px",
         "width": width + "px",
         "height": height + "px"
      })

      // handle hidden hooks
      if(hidden) {
         // turn this hook into a ghost
         hook.addClass("ghost");

         // prepare for clustering
         ghosts.push({
            "hook": hook,
            "x": offset.left + width / 2,
            "y": offset.top + height / 2
         })
      }
      else {
         // for hooks that have just been de-hidden
         hook.removeClass("ghost")
      }

      hook.toggle(!hidden || model.showGhosts);
      // annoying necessity with Wunderlist
      hook.removeClass("animate-up")
   });
}



function generateClusters() {

   // delete previous clusters
   $("#hooks .plus-icon").remove();

   // groups of ghost hooks that are near each other
   var clusters = [];

   var cluster, ghost;
   while(ghosts.length > 0) {
      ghost = ghosts.pop();
      cluster = {
         "ghosts": [ghost]
      };

      // Add to this cluster all ghosts that are close to ghost
      for(var i = 0; i < ghosts.length; i++) {
         if(distance(ghost, ghosts[i]) <= parameters.distance) {
            cluster.ghosts.push(ghosts[i]);
            ghosts.splice(i, 1);
            i--;
         }
      }

      // compute the position of the cluster
      computeBarycenter(cluster);

      clusters.push(cluster);
   }

   // Create one plus icon per cluster (even if it contains only one elements)
   clusters.forEach(function(cluster) {
      $("<img class='plus-icon'>")
         .appendTo("#hooks")
         .css({
            "left": cluster.x - 18 + "px",
            "top": cluster.y - 18 + "px"
         })
         .attr("src",
            model.showGhosts ? "//localhost:8888/img/minus_dark_yellow.png" : "//localhost:8888/img/plus_dark_yellow.png")
         .data("cluster", cluster)
   })
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
               left: obj.left + 'px',
               top: obj.top + 'px'
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
      if(model.showGhosts) {

         // first, we need to display all the anchors corresponding to the ghosts
         var anchor;
         cluster.ghosts.forEach(function(ghost) {
            ghost.hook.show();
            anchor = ghost.hook.data("anchor")
            anchor.css("transition", "none!important")
            anchor.removeClass("animate-up")
         })

         // then we update the position of ALL hooks
         $(".customizable").each(function(i, hook) {
            $(hook).css({
               "top": $(hook).data("anchor").offset().top + "px",
               "left": $(hook).data("anchor").offset().left + "px"
            })
         })

         // finaly we reposition the cluster
         computeBarycenter(cluster)
         $(this).css({
            "left": cluster.x - 18 + "px",
            "top": cluster.y - 18 + "px"
         })
      }
      else {
         // hide the ghosts and anchors of this cluster
         cluster.ghosts.forEach(function(ghost) {
            ghost.hook.hide();
            ghost.hook.data("anchor").addClass("animate-up")
         })

         // then we update the position of ALL hooks
         $(".customizable").each(function(i, hook) {
            $(hook).css({
               "top": $(hook).data("anchor").offset().top + "px",
               "left": $(hook).data("anchor").offset().left + "px"
            })
         })

         // finaly we reposition the cluster
         computeBarycenter(cluster)
         $(this).css({
            "left": cluster.x - 18 + "px",
            "top": cluster.y - 18 + "px"
         })
      }
   })
}
