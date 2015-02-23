function generateHooks() {

   // elements of the original interface that can serve to anchor (intrinsically or semantically) options
   var mapping_anchors;
   // clones of the anchors with which users interact in customization mode
   var mapping_hooks;
   // list of all the hooks that are currently hidden
   ghosts = [];

   // for each selector-options pairs, generate the appropriate hooks
   mappings.forEach(function(mapping) {

      /*----------- store style & position of anchors -----------*/

      mapping_anchors = $(mapping.selector);

      if(mapping_anchors.length === 0)
         console.log(mapping.selector, "failed to match any element for", mapping.options)

      // store the current style
      mapping_anchors.each(function() {
         $(this).data("style", getRelevantCSS($(this), parentCSS));
      })
      mapping_anchors.find("*").each(function() {
         $(this).data("style", getRelevantCSS($(this), childrenCSS));
      })


      /*------------- handle hidden anchors -------------*/

      // checkif one option associated with this selector is a show/hide of type hidden
      var hidden = false;
      mapping.options.forEach(function(option_id) {
         if(options[option_id].hideable && options[option_id].value == "hidden")
            hidden = true;
      });

      mapping_anchors.each(function() {
         if(hidden) {
            // briefly show this anchor to measure its position
            $(this).removeClass("animate-up")

            // store this particular anchor's position for clustering
            $(this).data("coordinates", $(this).offset());
            $(this).data("width", $(this).width());
            $(this).data("height", $(this).height());

            // then hide it again
            $(this).addClass("animate-up")
         }
         else {
            $(this).data("coordinates", $(this).offset());
         }
      })


      /*------------- create hooks -------------*/

      // clone with their data, but remove event binders with .off()
      mapping_hooks = mapping_anchors.clone(true).off();
      mapping_hooks.appendTo("#hooks");

      // position the hooks on top of the elements
      mapping_hooks.each(function() {
         //$(this).offset($(this).data("coordinates")); doesn't work
         $(this)
            .css($(this).data("style"))
            .attr('disabled', 'disabled')
            .removeAttr('href')
            .css({
               "left": $(this).data("coordinates").left + "px",
               "top": $(this).data("coordinates").top + "px"
            })
            .data("options", mapping.options);

         $(this).find("*").each(function() {
            $(this)
               .css($(this).data("style"))
               .attr('disabled', 'disabled')
               .removeAttr('href')
               .addClass("customizable-children");
         });

         if(hidden) {
            $(this).addClass("ghost");
            $(this).hide();

            // prepare for clustering
            ghosts.push({
               hook: $(this),
               options: mapping.options,
               x: $(this).data("coordinates").left + $(this).data("width") / 2,
               y: $(this).data("coordinates").top + $(this).data("height") / 2
            })

         }
      })

      mapping_hooks.addClass("customizable");
   });


   /*------------- generate clusters -------------*/

   // groups of ghost hooks that are near each other
   clusters = [];
   var cluster, ghost;

   while(ghosts.length > 0) {
      ghost = ghosts.pop();
      cluster = {
         hooks: [ghost]
      };

      // Add to this cluster all ghosts that are close to ghost
      for(var i = 0; i < ghosts.length; i++) {
         if(distance(ghost, ghosts[i]) <= parameters.distance) {
            cluster.hooks.push(ghosts[i]);
            ghosts.splice(i, 1);
            i--;
         }
      }

      // compute the barycenter of the cluster
      cluster.x = Math.mean(cluster.hooks.map(function(hook) {
         return hook.x;
      }))
      cluster.y = Math.mean(cluster.hooks.map(function(hook) {
         return hook.y;
      }))

      clusters.push(cluster);
   }

   // Create one plus icon per cluster (even if it contains only one elements)
   clusters.forEach(function(cluster) {
      $("<img class='plus-icon' src='//localhost:8888/img/plus_dark_yellow.png'>")
         .appendTo("#hooks")
         .css({
            "left": cluster.x - 18 + "px",
            "top": cluster.y - 18 + "px"
         })
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

   $(".plus-icon").click(function() {
      $(".ghost").toggle();
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

}
