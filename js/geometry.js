var geometry = {
   "panelHeight": 373,
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
geometry.getAllOptionsHeight = function() {
   var numVisibleOptions = angular.element($("#ad-hoc-panel")).scope().getTotalNumberVisibleOptions();
   console.log(model.fullPanel(), numVisibleOptions)

   if (model.fullPanel() && model.activeTab.bloat)
      return "auto";
   else
      return computeHeightIncludingDescription(numVisibleOptions);
}

geometry.getPanelHeight = function() {
   if (model.fullPanel())
      return geometry.panelHeight;
   else
      return geometry.getAllOptionsHeight();
}

function computeHeightIncludingDescription(numOptions) {
   var result = numOptions * geometry.getOptionHeight();
   if (model.fullPanel() && model.activeTab.description)
      result += 58;
   return result;
}
