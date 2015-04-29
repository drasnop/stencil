var dataManager = {};

dataManager.initializeDataStructuresIfAllLoaded = function() {
   if(Object.keys(model.options).length > 0 && model.mappings.length > 0 && model.tabs.length > 0) {

      // creates a convenient enumerating (but non-enumerable!) function
      Object.defineProperty(model.options, "forEach", {
         value: function(callback) {
            Object.keys(this).forEach(function(key){
               callback(this[key]);
            }, this)
         }
      })

      // set a pointer to the default value for each option, instead of a string
      model.options.forEach(function(option) {
         var valueName = option.value; // the default is stored as a string in JSON
         createPointerToValueObjectFromValueName(option, valueName);
      })


      // set option.anchored flag (doesn't take into account flag visible so far)
      model.mappings.forEach(function(mapping) {
         mapping.options.forEach(function(option_id) {
            model.options[option_id].anchored = true;
         });
      })


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

      // sets the active tab to a default, to avoid undefined errors before the first call to showPanel()
      model.activeTab = model.tabs[0];

      console.log("All data pre-processed")

      // For debug purposes
      //enterCustomizationMode();

      // Initialize experiment
      if(experiment.experiment){
         dataManager.initializeAppOptionsFromFile();
         experiment.generateOptionsSequence();
         experiment.startExperiment();
      }
   }
}

function createPointerToValueObjectFromValueName(option, valueName) {
   for(var i in option.values) {
      if(option.values[i].name == valueName) {
         option.value = option.values[i];
         break;
      }
   }
}


// UNUSED in the experiment software (instead, load the default options)
dataManager.initializeOptionsFromApp = function() {

   console.log("Syncing options with underlying app...")

   // dev mode: not linked with Wunderlist backbone
   if(typeof sync == "undefined" || typeof sync.collections == "undefined")
      return;

   var value;
   model.options.forEach(function(option) {

      value = sync.collections.settings.where({
         key: option.id
      })[0].get("value")

      // I am using booleans, but they are storing these options as strings!
      switch(value) {
         case "true":
            if(option.value !== true)
               console.log("- updating:", option.id, true)
            option.value = true;
            break;
         case "false":
            if(option.value !== false)
               console.log("- updating:", option.id, false)
            option.value = false;
            break;
         default:
            if(option.value.name !== value)
               console.log("- updating:", option.id, value)
            createPointerToValueObjectFromValueName(option, value);
      }
   })
}

// FOR THE EXPERIMENT: modify Wunderlist options to match the default ones defined in the file
dataManager.initializeAppOptionsFromFile = function() {

   console.log("Syncing options of underlying app...")

   // dev mode: not linked with Wunderlist backbone
   if(typeof sync == "undefined" || typeof sync.collections == "undefined")
      return;

   model.options.forEach(function(option) {

      // don't force sync the "deep" parameters that the app uses internally
      if(typeof option.notUserAccessible !== "undefined" && option.notUserAccessible)
         return;

      sync.collections.settings.where({
         key: option.id
      })[0].set({
         value: option.values.length > 0 ? option.value.name : (option.value? "true" : "false")
      })
   })
}

dataManager.updateOption = function(id, value) {

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
      // dev mode: not linked with Wunderlist backbone
      console.log("no underlying application settings to update for: ", id)
   }
}
