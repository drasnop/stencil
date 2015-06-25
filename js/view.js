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
   // When expanding/contracting the panel, delay the entrance of the options that weren't visible 
   // to allow the ones moving up and down to finish their movement
   view.positionAllOptions = function(delayEntrance) {

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

      // debug: make sure I'm animating the correct number of options
      var countFade = 0;
      var countMove = 0;

      // Position all visible options, and determine if some should be animated
      view.visibleOptions.forEach(function(option) {
         var newIndex = view.visibleOptions.indexOf(option);
         var oldIndex = prevVisibleOptions.indexOf(option);
         var optionElement = $('#' + option.id);


         /* position + move animation */

         // if the option was visible before, but has changed position, animate it to its new position
         if (oldIndex >= 0 && oldIndex != newIndex) {
            optionElement.animate({
               "top": geometry.getOptionTop(option)
            }, 500)

            countMove++;
         }
         // otherwise, simply set it to its new position
         else
            optionElement.css("top", geometry.getOptionTop(option) + 'px')


         /* opacity + fade in animation */

         // if it's a non-highlighted option in a tab containing highlighted options, ephemeral adaptation
         if (model.fullPanel() && !option.selected && option.tab.count > 0) {

            // if we are expanding the panel, wait before fading in
            if (delayEntrance) {
               optionElement.delay(400).animate({
                  "opacity": 1
               }, 400)
            }

            // if we are just opening tabs or switching tabs, play ephemeral animation immediately
            else {
               optionElement.animate({
                  "opacity": 1
               }, 700)
            }

            countFade++;
         }

         // if we are contracting the panel, wait before fading in
         else if (!model.fullPanel() && delayEntrance) {

            optionElement.delay(500).animate({
               "opacity": 1
            }, 300)

            countFade++;
         }

         // otherwise, simply make the option element visible
         else
            optionElement.css("opacity", 1)

      });

      // Hide all non-visible options, to prepare fade-in entrance later if needed
      model.options.forEach(function(option) {
         if (view.visibleOptions.indexOf(option) < 0)
            $('#' + option.id).css("opacity", 0)
      });

      // console.log("move", countMove, "fadein", countFade, "fullPanel", model.fullPanel())
   }

   view.resetVisibleOptions = function() {
      view.visibleOptions = [];

   }

   // Hide all non-visible options, to prepare fade-in entrance later if needed
   view.hideAllNonVisibleOptions = function() {
      model.options.forEach(function(option) {
         $('#' + option.id).css("opacity", 0)
      });
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
