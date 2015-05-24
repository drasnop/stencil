var geometry = {
   "panelHeight": 340,
   "tabsHeight": 45
}

geometry.getOptionHeight = function() {
   if (model.optionsVisibility == 1 && !model.fullPanel())
      return 38;

   return 38;
}

geometry.getOptionTop = function(filteredIndex) {
   return computeHeightIncludingDescription(filteredIndex);
}

geometry.getTotalHeight = function(numVisibleOptions) {
   return computeHeightIncludingDescription(numVisibleOptions);
}

function computeHeightIncludingDescription(numOptions) {
   var result = numOptions * geometry.getOptionHeight();
   if (model.fullPanel() && model.activeTab.html)
      result += 58;
   return result;
}
