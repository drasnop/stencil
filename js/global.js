var model = {
   // all options, indexed by their option_ID
   "options": {},
   // all tabs, in order, each containing an ordered list of option_ID
   "tabs": [],
   // mappings between (multiple) options and (multiple) jQuery selectors
   "mappings": [],
   // Type of ad-hoc panel shown: 0=minimum, 1=linked, 2=highlighted
   "optionsVisibility": 0,
   // Turn highlighting in the full panel view off in minimum
   highlighting: function() {
      var highlighting = [true, true, true];
      return highlighting[model.optionsVisibility];
   },
   // Whether the back arrow appears in the expanded panel
   backArrow: function() {
      var backArrow = [true, true, false];
      return backArrow[model.optionsVisibility];
   },
   // For the linked panel, whether the current view is minimal or expanded to full highlighted panel
   fullPanel: function() {
      var fullPanelDefault = [false, false, true];
      return model.panelExpanded || fullPanelDefault[model.optionsVisibility];
   },
   // Show options panel in customization mode
   "showPanel": false,
   // Whether the user has expanded the panel to show all the options
   "panelExpanded": false,
   // Whether to show the full list of shortcuts
   "showMoreShortcuts": false,

   "activeTab": "none",

   // set of options mapped with the selected anchor
   "selectedOptions": [],

   // hooks, x, y, icon, showGhosts
   "clusters": []
}


var parameters = {
   // distance (in px) below which ghost anchors are bundled in clusters
   "distance": 200,
   // clean definition of key codes
   "KEYCODE_ESC": 27
}
