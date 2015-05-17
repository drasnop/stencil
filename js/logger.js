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

// store participant info, options and values sequences, and prepare trials logging
logger.initialize = function() {
   logger.firebase = new Firebase("https://incandescent-torch-4042.firebaseio.com/stencil-experiment/mturk/" + experiment.email);
   console.log("Initializing logging to " + logger.firebase.toString())

   // make sure the trials list is empty
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
logger.compressArraysOfOptions = function(arr) {
   return arr.map(function(options) {
      return logger.compressOptions(options);
   })
}

// nothing will be stored if the array is empty (no empty arrays in Firebase)
logger.compressOptions = function(options) {
   return options.map(function(option) {
      return logger.compressOption(option);
   })
}

// nothing will be stored if the array is empty (no empty arrays in Firebase)
logger.compressTabs = function(tabs) {
   return tabs.map(function(tab) {
      return logger.compressTab(tab);
   })
}


/*  compress() calls flatten() on .tab or .options, while flatten() returns list of ids */

logger.compressOption = function(option) {
   if ($.isEmptyObject(option))
      return {};

   // shallow copy
   var flattened = $.extend({}, option);

   // prevent infinite recursion by storing only option.id in that tab
   flattened["tab"] = flattenTab(option["tab"]);

   // remove non-interesting data
   delete flattened["$$hashKey"];
   delete flattened["__proto__"];

   return flattened;
}

flattenOption = function(option) {
   if ($.isEmptyObject(option))
      return {};

   // shallow copy
   var flattened = $.extend({}, option);

   // prevent infinite recursion by storing only option.id in that tab
   flattened["tab"] = option["tab"].name;

   // remove non-interesting data
   delete flattened["$$hashKey"];
   delete flattened["__proto__"];

   return flattened;
}


logger.compressTab = function(tab) {
   if ($.isEmptyObject(tab))
      return {};

   // shallow copy
   var flattened = $.extend({}, tab);

   // prevent infinite recursion by storing only option.id in that tab
   flattened["options"] = tab["options"].map(function(option) {
      return flattenOption(option);
   });
   // remove non-interesting data
   delete flattened["$$hashKey"];
   delete flattened["__proto__"];

   return flattened;
}


flattenTab = function(tab) {
   if ($.isEmptyObject(tab))
      return {};

   // shallow copy
   var flattened = $.extend({}, tab);

   // prevent infinite recursion by storing only option.id in that tab
   flattened["options"] = tab["options"].map(function(option) {
      return option.id;
   });
   // remove non-interesting data
   delete flattened["$$hashKey"];
   delete flattened["__proto__"];

   return flattened;
}
