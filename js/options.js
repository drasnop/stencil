/* 
 * Manage the display of options in the customization panel, via a filtered index
 * which contains the true index of each visible option (discounting the options that are hidden)
 */
var options = (function() {

   var options = {
      // True index of each visible option (discounting the options that are hidden)
      // format: {"tabName": [indexes]}
      "filteredIndex": {},
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

   // update (or create) the filteredIndex for all options
   options.updateFilteredIndex = function() {
      model.tabs.forEachNonBloat(function(tab) {
         tab.options.forEach(function(option) {
            updateFilteredIndexOption(option);
         });
      })
   }

   function updateFilteredIndexOption(option) {
      if (option.index === 0)
         options.filteredIndex[option.tab.name][option.index] = options.isOptionVisible(option) ? 0 : -1;
      else
         options.filteredIndex[option.tab.name][option.index] = options.filteredIndex[option.tab.name][option.index - 1] + (options.isOptionVisible(option) ? 1 : 0);
   }

   // sum of 1 + index of the last element in each tab
   options.getTotalNumberVisibleOptions = function() {
      var count = 0;
      var indexesInTab;
      for (var tabName in options.filteredIndex) {
         indexesInTab = options.filteredIndex[tabName];
         count += indexesInTab[indexesInTab.length - 1] + 1;
      }
      return count;
   }

   // sum of filtered indexes in the tab preceding this one + filtered index in this tab
   options.getFilteredIndex = function(tab, index) {
      var filtered = 0;
      var indexesInTab;

      // enumerate tabs in order, skipping bloat tabs, stopping when the target tab is found
      for (var i = 0; i < model.tabs.length; i++) {
         if (!model.tabs[i].bloat) {
            var tabName = model.tabs[i].name;

            if (tabName == tab.name) {
               // get the filtered index of the target option in the target tab
               filtered += options.filteredIndex[tab.name][index];
               break;
            } else {
               // for all preceding tabs, add their maximal filtered index
               indexesInTab = options.filteredIndex[tabName];
               filtered += indexesInTab[indexesInTab.length - 1] + 1;
            }
         }
      }
      return filtered;
   }

   return options;
})();
