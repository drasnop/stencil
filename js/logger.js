var logger = {
   // firebase for storing participant data
   "firebase": {},
};

// if the Wunderlist email appears in Firebase, initialize the logger; other cancel experiment
logger.checkEmail = function(callbackSuccess, callbackError) {
   var mturk = new Firebase("https://incandescent-torch-4042.firebaseio.com/stencil-experiment/mturk/");

   mturk.once('value', function(snapshot) {
      if (snapshot.hasChild(experiment.email)) {
         console.log("Success! MTurk firebase contains", experiment.email)
         callbackSuccess();
      } else {
         console.log("Failure! MTurk firebase doesn't contain", experiment.email)
         callbackError();
      }
   });
}

// connects to the appropriate Firebase, and retrieve key information
logger.initialize = function() {
   console.log("Initializing logging to " + logger.firebase.toString() + "...")
   logger.firebase = new Firebase("https://incandescent-torch-4042.firebaseio.com/stencil-experiment/mturk/" + experiment.email);

   logger.firebase.child("condition").once('value', function(snapshot) {
      experiment.condition = snapshot.child("interface").val();
      experiment.oppositeDefaults = snapshot.child("oppositeDefaults").val();
      console.log("Success! Condition: " + experiment.condition + "  oppositeDefaults: " + experiment.oppositeDefaults)
      logger.prepareLogging();
   })
}

// store participant info, options and values sequences, and prepare trials logging
logger.prepareLogging = function() {
   // make sure the trials list is empty
   logger.firebase.child("/tutorial").set(null)
   logger.firebase.child("/trials").set(null);

   // save the full set of options that were used in this experiment, just to be sure
   logger.firebase.child("/options").set(logger.compressAllUserAccessibleOptions());

   // save the full set of tabs that were used in this experiment, just to be sure (+used in questionnaire)
   logger.firebase.child("/tabs").set(logger.compressAllTabs());

   // save the full options and values sequences, just to be sure
   logger.firebase.child("/sequences").set({
      "optionsSequence": logger.compressOptions(experiment.optionsSequence),
      "valuesSequence": experiment.valuesSequence
   })
}

logger.saveTrial = function() {
   logger.firebase.child("/trials").push(experiment.trial.loggable(), function(error) {
      if (error) {
         console.log("Trial " + experiment.trial.number + " could not be saved." + error);
      } else {
         console.log("Trial " + experiment.trial.number + " saved successfully.");
      }
   });
}


// -------------------- flatterners  ---------------------- //

logger.compressAllUserAccessibleOptions = function() {
   var compressed = {};
   model.options.forEach(function(option) {
      if (!option.notUserAccessible)
         compressed[option.id] = logger.compressOption(option);
   });
   return compressed;
}

logger.compressAllTabs = function() {
   var compressed = {};
   model.tabs.forEach(function(tab) {
      compressed[tab.name] = logger.compressTab(tab);
   });
   return compressed;
}

// nothing will be stored if the array is empty (no empty arrays in Firebase)
logger.compressOptions = function(options) {
   return options.map(function(option) {
      return logger.compressOption(option);
   })
}


/*  compress() calls flatten() on .tab or .options, while flatten() returns list of ids */

logger.compressOption = function(option) {
   return compress(option, "tab", flattenTab);
}

flattenTab = function(tab) {
   return compress(tab, "options", function(option) {
      return option.id;
   });
}

logger.compressTab = function(tab) {
   return compress(tab, "options", flattenOption);
}

flattenOption = function(option) {
   return compress(option, "tab", function(tab) {
      return tab.name;
   })
}


// return the compress version of an object (option or tab), flattening its children (tab or options)
function compress(obj, childrenName, childrenFlattener) {
   if ($.isEmptyObject(obj))
      return {};

   // shallow copy
   var flattened = $.extend({}, obj);

   // prevent infinite recursion, distinguishing between tab.options (Array) and option.tab (single Object)
   if (Array.isArray(obj[childrenName])) {
      flattened[childrenName] = obj[childrenName].map(function(child) {
         return childrenFlattener(child);
      });
   } else
      flattened[childrenName] = childrenFlattener(obj[childrenName]);

   // remove non-interesting data
   delete flattened["$$hashKey"];
   delete flattened["__proto__"];

   return flattened;
}
