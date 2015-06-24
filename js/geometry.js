var geometry = {
   "panelHeight": 373,
   "tabsHeight": 45,
   "optionHeight": 38
}

geometry.getOptionHeight = function() {
   // thus, all options have the same height (checkboxes are simply vertically centered)
   return geometry.optionHeight;
}

geometry.getOptionTop = function(filteredIndex) {
   return computeHeightIncludingDescription(filteredIndex);
}

// return a string to be used in inline css
geometry.getAllOptionsHeight = function() {
   var numVisibleOptions = angular.element($("#ad-hoc-panel")).scope().getTotalNumberVisibleOptions();

   if (model.fullPanel() && model.activeTab.bloat)
      return "auto";
   else
      return computeHeightIncludingDescription(numVisibleOptions);
}

geometry.getPanelHeight = function() {
   if (model.fullPanel()) {
      // thus far, a fixed height
      return geometry.panelHeight;
   } else {
      // take into account the margins top and bottom of #options-list
      return geometry.getAllOptionsHeight() + 8 + 20;
   }
}

function computeHeightIncludingDescription(numOptions) {
   var result = numOptions * geometry.getOptionHeight();
   if (model.fullPanel() && model.activeTab.description)
      result += 58;
   return result;
}
