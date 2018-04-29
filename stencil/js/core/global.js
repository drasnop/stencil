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
   "optionsVisibility": 1,

   // For the linked panel, whether the current view is minimal or expanded to full highlighted panel
   fullPanel: function() {
      var fullPanelDefault = [true, false, false, true];
      return model.panelExpanded || fullPanelDefault[model.optionsVisibility];
   },
   // Show options panel in customization mode
   "showPanel": false,
   // Whether the user has expanded the panel to show all the options
   "panelExpanded": false,
   // Tab current displayed in the full panel
   "activeTab": "",


   /* other display variables */

   "progressBar": {
      "message": "Loading... (should not take more than 10 seconds)",
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
   //"serverURL": "localhost:8888",
   "serverURL": "tequila.cs.ubc.ca/stencil",
   // whether the system is currently used to conduct an experiment
   "experiment": true,
   // distance (in px) below which ghost anchors are bundled in clusters
   "distance": 200,
   // height (in px) of the experiment progress bar, necessary to offset the position of the hooks
   "progressBarHeight": 45,
   // clean definition of key codes
   "KEYCODE_ESC": 27,
   // animation parameters for the ghosts (should be set relatively to the top transition duration of hooks)
   "ghostsSlideDownDuration": 200,
   "ghostsSlideUpDuration": 400,
   // animation parameters for the panel
   "panelSizeChangeDuration": 500
}
