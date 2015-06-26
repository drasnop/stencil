/* 
 * Does some geometric computations to determine how to display options in the customization panel
 */

var geometry = (function() {
   var geometry = {
      "optionHeight": 38,
      "tabsHeight": 45,
      "linkToTabWidth": 119,
      "fullPanelWidth": 590,
      "backArrowWidth": 45,
      "fullPanelHeight": 373
   }


   /* options */

   // thus far, all options have the same height (checkboxes are simply vertically centered)
   geometry.getOptionHeight = function() {
      return geometry.optionHeight;
   }

   // add 30 to account for padding, and 2 because nothing is perfect
   geometry.getOptionWidth = function(option) {
      var optionElement = $('#' + option.id);
      var baseWidth = optionElement.children(".left-column").width() + optionElement.find(".middle-column label").textWidth() + 30 + 2;
      return baseWidth + (model.optionsVisibility == 2 ? geometry.linkToTabWidth : 0);
   }

   geometry.getOptionTop = function(option) {
      return computeHeightIncludingDescription(view.getFilteredIndex(option));
   }


   /* panel */

   geometry.getPanelHeight = function() {
      // thus far, a fixed height for the full panel
      if (model.fullPanel())
         return geometry.fullPanelHeight;

      // small panel: take into account the margins top and bottom of #options-list
      return geometry.getAllOptionsHeight() + 8 + 20;
   }

   geometry.getPanelWidth = function() {

      if (model.fullPanel())
         return geometry.fullPanelWidth + (model.optionsVisibility == 3 ? 0 : geometry.backArrowWidth);

      return view.visibleOptions.reduce(function(maxWidth, option) {
         return Math.max(maxWidth, geometry.getOptionWidth(option));
      }, 0);
   }


   /* helpers */

   // return a string to be used in inline css
   geometry.getAllOptionsHeight = function() {
      var numVisibleOptions = view.getTotalNumberVisibleOptions();

      if (model.fullPanel() && model.activeTab.bloat)
         return "auto";
      else
         return computeHeightIncludingDescription(numVisibleOptions);
   }

   function computeHeightIncludingDescription(numOptions) {
      var result = numOptions * geometry.getOptionHeight();
      if (model.fullPanel() && model.activeTab.description)
         result += 58;
      return result;
   }

   // Calculate width of text from DOM element or string. By Phil Freo <http://philfreo.com>
   $.fn.textWidth = function(text, font) {
      if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
      $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
      return $.fn.textWidth.fakeEl.width();
   };

   return geometry;
})();
