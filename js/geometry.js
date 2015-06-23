var geometry = {
   "panelHeight": 340,
   "tabsHeight": 45
}

geometry.getOptionHeight = function() {
   if (model.optionsVisibility == 2 && !model.fullPanel())
      return 38;

   return 38;
}

geometry.getOptionTop = function(filteredIndex) {
   return computeHeightIncludingDescription(filteredIndex);
}

// return a string to be used in inline css
geometry.getTotalHeight = function(numVisibleOptions) {
   if (model.fullPanel() && model.activeTab.bloat)
      return "auto";
   else
      return computeHeightIncludingDescription(numVisibleOptions) + 'px';
}

function computeHeightIncludingDescription(numOptions) {
   var result = numOptions * geometry.getOptionHeight();
   if (model.fullPanel() && model.activeTab.description)
      result += 58;
   return result;
}
