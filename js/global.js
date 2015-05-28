var model = {

   /* data */

   // all options, indexed by their option_id
   "options": {},
   // all tabs, in order, each containing an ordered list of option_id
   "tabs": [],
   // mappings between (multiple) options and (multiple) jQuery selectors
   "mappings": [],

   /* hooks, anchors and clusters */

   // set of options mapped with the selected anchor
   "selectedOptions": [],
   // the anchor currently selected (jQuery object)
   "selectedAnchor": {},
   // hooks, x, y, icon, showGhosts
   "clusters": [],

   /* display variables for customization panel */

   // Type of ad-hoc panel shown: 0=control, 1=minimal, 2=mixed, 3=full with highlights
   "optionsVisibility": 3,

   // For the linked panel, whether the current view is minimal or expanded to full highlighted panel
   fullPanel: function() {
      var fullPanelDefault = [true, false, false, true];
      return model.panelExpanded || fullPanelDefault[model.optionsVisibility];
   },
   // Show options panel in customization mode
   "showPanel": false,
   // Whether the user has expanded the panel to show all the options
   "panelExpanded": false,
   // Whether to show the full list of shortcuts
   "showMoreShortcuts": false,
   // Tab current displayed in the full panel
   "activeTab": "",

   // True index of each visible option (discounting the options that are hidden) {"tabName": [indexes]}
   "filteredIndex": {},

   /* other display variables */

   "progressBar": {
      "message": "Almost done...",
      "buttonLabel": ""
   },
   "modal": {
      "header": "",
      "message": "",
      "buttonLabel": "",
      "green": "",
      "action": "",
      "hideOnClick": ""
   }
}


var parameters = {
   // server base url
   "serverURL": "localhost:8888",
   //"serverURL": "tequila.cs.ubc.ca/stencil",
   // whether the system is currently used to conduct an experiment
   "experiment": true,
   // distance (in px) below which ghost anchors are bundled in clusters
   "distance": 200,
   // height (in px) of the experiment progress bar, necessary to offset the position of the hooks
   "progressBarHeight": 45,
   // clean definition of key codes
   "KEYCODE_ESC": 27,
   // animation parameters (should be set relatively to the top transition duration of hooks)
   "ghostsSlideDownDuration": 200,
   "ghostsSlideUpDuration": 400
}
