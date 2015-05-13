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
   var top = filteredIndex * geometry.getOptionHeight();
   if (model.fullPanel() && typeof model.activeTab.description !== "undefined")
      top += 78;
   return top;
}

geometry.getTotalHeight = function(numberVisibleOptions) {
   var totalHeight = numberVisibleOptions * geometry.getOptionHeight();
   if (model.fullPanel() && typeof model.activeTab.description !== "undefined")
      totalHeight += 78;
   return totalHeight;
}
