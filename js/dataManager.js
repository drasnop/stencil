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

      // add a helper function to each option
      model.options.forEach(function(option) {
         // use defineProperty syntax to avoid it being logged later on
         Object.defineProperty(option, "hasHighlightableHookOrCluster", {
            value: function() {
               // check if there is at least one hook or one cluster-marker visible
               // the hook can be a hidden ghost, though
               return option.anchored && $(".highlightable").filter(function() {
                  return $(this).data("options").indexOf(option) >= 0;
               }).filter(":visible").length > 0;
            }
         });
      })


      model.options.forEach(function(option) {
         // use defineProperty syntax to avoid it being logged later on
         Object.defineProperty(option, "hasVisibleHook", {
            value: function() {
               // check if there is at least one visible, non-hidden hook
               return this.hasHighlightableHookOrCluster() &&
                  (!this.hideable || this.value !== "hidden")
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

      // creates filteredIndex
      model.tabs.forEachNonBloat(function(tab) {
         model.filteredIndex[tab.name] = [];
      });

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


// UNUSED in the experiment software (instead, load the default options)
dataManager.initializeOptionsFromApp = function() {

   console.log("Syncing options with underlying app...")

   // dev mode: not linked with Wunderlist backbone
   if (typeof sync == "undefined" || typeof sync.collections == "undefined")
      return;

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

   console.log("Syncing options of underlying app...")

   // dev mode: not linked with Wunderlist backbone
   if (typeof sync == "undefined" || typeof sync.collections == "undefined")
      return;

   model.options.forEach(function(option) {

      // don't force sync the "deep" parameters that the app uses internally
      if (option.notUserAccessible)
         return;

      sync.collections.settings.where({
         key: option.id
      })[0].set({
         value: dataManager.formatValueForWunderlist(option.value)
      })
   })
}

// FOR THE EXPERIMENT: in control condition, rectify a Wunderlist option to match its correct value if needed
dataManager.syncAppOptionWith = function(option) {

   // dev mode: not linked with Wunderlist backbone
   if (typeof sync == "undefined" || typeof sync.collections == "undefined")
      return;

   sync.collections.settings.where({
      key: option.id
   })[0].set({
      value: dataManager.formatValueForWunderlist(option.value)
   })
}



dataManager.updateOption = function(id, value) {

   if (typeof sync != "undefined" && typeof sync.collections != "undefined") {
      console.log("updating:", id, value)

      sync.collections.settings.where({
         key: id
      })[0].set({
         value: dataManager.formatValueForWunderlist(value)
      })

      // if the visibility of the corresponding hook has changed, update hooks and clusters, with animation
      if (value == "hidden" || value == "visible" || value == "auto")
         updateHooksAndClusters(true);
   } else {
      // dev mode: not linked with Wunderlist backbone
      console.log("no underlying application settings to update for: ", id)
   }
}


// Must convert boolean into strings for Wunderlist...
dataManager.formatValueForWunderlist = function(value) {
   if (typeof value === "boolean")
      return value ? "true" : "false";
   else
      return value;
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
