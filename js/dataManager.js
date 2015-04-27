var dataManager = {};

dataManager.initializeDataStructuresIfAllLoaded = function() {
   if(Object.keys(model.options).length > 0 && model.mappings.length > 0 && model.tabs.length > 0) {

      // replace tab.option_ids by pointers to actual options
      model.tabs.forEach(function(tab) {
         var tabOptions = tab.options.map(function(option_id) {
            return model.options[option_id];
         })
         tab.options = tabOptions;
      })

      // add pointer to tab and index to options
      model.tabs.forEach(function(tab) {
         tab.options.forEach(function(option) {
            option.tab = tab;
            option.index = i;
         })
      })

      // add tab index information for future sorting
      for(var i = 0, len = model.tabs.length; i < len; i++) {
         model.tabs[i].index = i;
      }

      // creates filteredIndex
      model.filteredIndex = model.tabs.map(function(tab) {
         return [];
      });

      // set option.anchored flag (doesn't take into account flag visible so far)
      model.mappings.forEach(function(mapping){
         mapping.options.forEach(function(option_id){
            model.options[option_id].anchored=true;
         });
      })

      // sets the active tab to a default, to avoid undefined errors before the first call to showPanel()
      model.activeTab = model.tabs[0];

      // For debug purposes
      //enterCustomizationMode();
   }
}

dataManager.initializeOptions = function() {

   console.log("Syncing options with underlying app...")

   // dev mode: not linked with Wunderlist backbone
   if(typeof sync == "undefined" || typeof sync.collections == "undefined")
      return;

   var value;
   for(var id in model.options) {
      // I am using booleans, but they are storing these options as strings!
      value = sync.collections.settings.where({
         key: id
      })[0].get("value")
      switch(value) {
         case "true":
            model.options[id].value = true;
            break;
         case "false":
            model.options[id].value = false;
            break;
         default:
            model.options[id].value = value;
      }

      // Hide the non-visible hooks (somewhat Wunderlist-specific, unfortunately)
      if(id.indexOf("visibility") >= 0) {
         switch(model.options[id].value) {
            case "auto":
            case "visible":
               model.options[id].hidden = false;
               break;
            case "hidden":
               model.options[id].hidden = true;
               break
         }
      }
   }
}

dataManager.updateOption = function(id, value) {

   // dev mode possible: not linked with Wunderlist backbone
   if(typeof sync != "undefined" && typeof sync.collections != "undefined") {
      console.log("updating:", id, value)

      sync.collections.settings.where({
         key: id
      })[0].set({
         value: value
      })

      if(value == "hidden" || value == "visible" || value == "auto")
         updateHooksAndClusters();
   }
   else {
      console.log("no underlying application settings to update for: ", id)
   }
}
