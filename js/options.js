/* 
 * Manage the display of options in the customization panel, via a filtered index
 * which returns the true index of each visible option (discounting the options that are hidden)
 */
var options = (function() {

   var options = {
      // List of all the options visible, ordered by tab and index in tab
      "visibleOptions": []
   };

   // Return true if an option is visible 
   options.isOptionVisible = function(option) {

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
   options.positionAllOptions = function() {

      var optionsToMove = [];
      var optionsToFadeIn = [];

      // Iterate through tabs and options in order, to build visibleOptions
      options.visibleOptions = [];
      for (var i = 0; i < model.tabs.length; i++) {
         var tab = model.tabs[i];

         if (!tab.bloat) {
            for (var j = 0; j < tab.options.length; j++) {
               var option = tab.options[j];

               if (options.isOptionVisible(option))
                  options.visibleOptions.push(option);
            }
         }
      }

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

   options.getTotalNumberVisibleOptions = function() {
      return options.visibleOptions.length;
   }

   // returns -1 if the option is not visible; otherwise its filtered index
   options.getFilteredIndex = function(option) {
      return options.visibleOptions.indexOf(option);
   }

   return options;
})();
