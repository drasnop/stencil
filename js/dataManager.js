var dataManager = {};

dataManager.initializeDataStructuresIfAllLoaded = function() {
   if (Object.keys(model.options).length > 0 && model.mappings.length > 0 && model.tabs.length > 0) {

      /* options */

      // creates a convenient enumerating (but non-enumerable!) function
      Object.defineProperty(model.options, "forEach", {
         value: function(callback) {
            Object.keys(this).forEach(function(key) {
               callback(this[key]);
            }, this)
         }
      })

      // convenient accessor for userAccessibleOptions
      Object.defineProperty(model.options, "getUserAccessibleOptions", {
         value: function() {
            var userAccessible = {};
            this.forEach(function(option) {
               if (typeof option.notUserAccessible === "undefined")
                  userAccessible[option.id] = option;
            });
            Object.defineProperty(userAccessible, "forEach", {
               value: model.options.forEach
            })
            return userAccessible;
         }
      })

      // add a helper function to each option, used for reverse highlighting and logging
      model.options.forEach(function(option) {
         // use defineProperty syntax to avoid it being logged later on
         Object.defineProperty(option, "hasHookOrCluster", {
            value: function() {
               // check if there is at least one hook or one cluster-marker visible
               // the hook can be a hidden ghost, though
               return option.anchored && $(".highlightable").filter(function() {
                  return $(this).data("options").indexOf(option) >= 0;
               }).filter(":visible").length > 0;
            }
         });
      })

      /* mappings */

      // set option.anchored flag (doesn't take into account flag visible so far)
      model.mappings.forEach(function(mapping) {
         mapping.options.forEach(function(option_id) {
            model.options[option_id].anchored = true;
         });
      })


      /* tabs */

      // creates a convenient enumerating (but non-enumerable!) function
      Object.defineProperty(model.tabs, "forEachNonBloat", {
         value: function(callback) {
            this.forEach(function(tab) {
               if (!tab.bloat)
                  callback(tab);
            })
         }
      })

      // replace tab.option_ids by pointers to actual options
      model.tabs.forEachNonBloat(function(tab) {
         var tabOptions = tab.options.map(function(option_id) {
            return model.options[option_id];
         })
         tab.options = tabOptions;
      })

      // add pointer to tab (and index in that tab) to options
      model.tabs.forEachNonBloat(function(tab) {
         for (var i = 0; i < tab.options.length; i++) {
            tab.options[i].tab = tab;
            // the display code only uses filteredIndex (not the real .index), but this could be useful in the analysis
            tab.options[i].index = i;
         }
      })

      // add tab index information for future sorting
      for (var i = 0, len = model.tabs.length; i < len; i++) {
         model.tabs[i].index = i;
      }

      // sets the active tab to a default, to avoid undefined errors before the first call to showPanel()
      model.activeTab = model.tabs[0];

      console.log("All data pre-processed")

      // For debug purposes
      //enterCustomizationMode();

      // initialize experiment
      if (parameters.experiment)
         experiment.initialize();
   }
}


/*
   initializeOptionsFromApp
      updateOption(option, value)

   initializeAppOptionsFromFile
      updateAppOption(id, value)
         formatValueForWunderlist
*/



// UNUSED in the experiment software (instead, load the default options)
dataManager.initializeOptionsFromApp = function() {

   // dev mode: not linked with Wunderlist backbone
   if (typeof sync == "undefined" || typeof sync.collections == "undefined") {
      console.log("No underlying app to initialize options from")
      return;
   }

   console.log("Syncing options with underlying app...")

   var value;
   model.options.forEach(function(option) {

      value = sync.collections.settings.where({
         key: option.id
      })[0].get("value")

      dataManager.updateOption(option, value);
   })
}

// FOR THE EXPERIMENT: modify Wunderlist options to match the default ones defined in the file
dataManager.initializeAppOptionsFromFile = function() {

   // dev mode: not linked with Wunderlist backbone
   if (typeof sync == "undefined" || typeof sync.collections == "undefined") {
      console.log("No underlying app options to be initialized from default options")
      return;
   }

   console.log("Syncing options of underlying app...")

   model.options.forEach(function(option) {

      // don't force sync the "deep" parameters that the app uses internally
      if (option.notUserAccessible)
         return;

      // the value will be formatted if needed by this method
      dataManager.updateAppOption(option.id, option.value);
   })
}

// I am using booleans, but Wunderlist stores these options as strings!
dataManager.updateOption = function(option, value) {
   switch (value) {
      case "true":
         if (option.value !== true)
            console.log("- updating:", option.id, true)
         option.value = true;
         break;
      case "false":
         if (option.value !== false)
            console.log("- updating:", option.id, false)
         option.value = false;
         break;
      default:
         if (option.value !== value)
            console.log("- updating:", option.id, value)
         option.value = value;
   }
}

// update a Wunderlist option to match its correct value, calling an update of hooks and clusters if needed
dataManager.updateAppOption = function(id, value, updateHooksAndClusters) {

   if (typeof sync != "undefined" && typeof sync.collections != "undefined") {
      sync.collections.settings.where({
         key: id
      })[0].set({
         value: dataManager.formatValueForWunderlist(value)
      })
   } else {
      // dev mode: not linked with Wunderlist backbone
      console.log("no underlying application settings to update for: ", id)
   }

   if (updateHooksAndClusters) {
      // if the visibility of the corresponding hook has changed, update hooks and clusters, with animation
      if (value == "hidden" || value == "visible" || value == "auto")
         hooksManager.updateHooksAndClusters(true);
   }
}

// Must convert boolean into strings for Wunderlist...
dataManager.formatValueForWunderlist = function(value) {
   if (typeof value === "boolean")
      return value ? "true" : "false";
   else
      return value;
}
