/* 
 * Manage the display of options in the customization panel, via a filtered index
 * which returns the true index of each visible option (discounting the options that are hidden).
 * This index will be translated into pixel positions by geometry
 */
var view = (function() {

   var view = {
      // List of all the options visible, ordered by tab and index in tab
      "visibleOptions": []
   };

   // Return true if an option is visible 
   view.isOptionVisible = function(option) {

      // hide option when panel is hidden, to have entrance animation on showPanel
      if (!model.showPanel)
         return false;

      // Minimal panel: only selected options are shown
      if (!model.fullPanel())
         return option.selected

      if (model.fullPanel()) {
         // Full panel: hide options in show more shortcuts
         if (option.more && !model.activeTab.showMoreOptions)
            return false;

         // Full panel: show only options from one tab (to have entrance effects)
         return option.tab == model.activeTab;
      }
   }

   // Determine where each option should appear, by construction an ordered array of the visible options
   view.positionAllOptions = function() {

      // Store the previous list of visible options, to compute diff
      var prevVisibleOptions = $.extend([], view.visibleOptions)

      // Iterate through tabs and options in order, to update visibleOptions
      view.visibleOptions = [];
      for (var i = 0; i < model.tabs.length; i++) {
         var tab = model.tabs[i];

         if (!tab.bloat) {
            for (var j = 0; j < tab.options.length; j++) {
               var option = tab.options[j];

               if (view.isOptionVisible(option))
                  view.visibleOptions.push(option);
            }
         }
      }

      // Determine if some options should be animated
      view.visibleOptions.forEach(function(option) {
         var newIndex = view.visibleOptions.indexOf(option);
         var oldIndex = prevVisibleOptions.indexOf(option);

         if (oldIndex < 0) {
            // if the option wasn't visible before, fade it in to its new position


         } else if (oldIndex != newIndex) {
            // if the option was visible before, but has changed position, animate it
            $('#' + option.id).animate({
               "top": geometry.getOptionTop(option)
            }, 500)
         }
      });

      /*      console.log("move", optionsToMove.length, "fadein", optionsToFadeIn.length)
            optionsToMove.forEach(function(option) {
               $('#' + option.id).animate({
                  "top": geometry.getOptionTop(option)
               }, 500, function() {
                  optionsToFadeIn.forEach(function(option) {
                     $('#' + option.id).animate({
                        "opacity": 1
                     }, 500)
                  });
               })
            });*/
   }

   view.getTotalNumberVisibleOptions = function() {
      return view.visibleOptions.length;
   }

   // returns -1 if the option is not visible; otherwise its filtered index
   view.getFilteredIndex = function(option) {
      return view.visibleOptions.indexOf(option);
   }

   return view;
})();
