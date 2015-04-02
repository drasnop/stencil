var model = {
   // all options, indexed by their option_ID
   "options": {},
   // mappings between (multiple) options and (multiple) jQuery selectors
   "mappings": [],
   // Type of ad-hoc panel shown: 0=minimum, 1=linked, 2=highlighted
   "optionsVisibility": 0,
   // Turn highlighting in the full panel view off in minimum
   highlighting: function() {
      var highlighting = [false, true, true];
      return highlighting[model.optionsVisibility];
   },
   // For the linked panel, whether the current view is minimal or expanded to full highlighted panel
   fullPanel: function() {
      var fullPanel = [false, false, true];
      return model.panelExpanded || fullPanel[model.optionsVisibility];
   },
   // Show options panel in customization mode
   "showPanel": false,
   // Whether the user has expanded the panel to show all the options
   "panelExpanded": true,
   // Whether to show the full list of shortcuts
   "showMoreShortcuts": false,

   "tabs": [{
      "name": "General",
      "count": 0
   }, {
      "name": "Shortcuts",
      "count": 0
   }, {
      "name": "Smart Lists",
      "count": 0
   }, {
      "name": "Notifications",
      "count": 0
   }],
   "activeTab": "",

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