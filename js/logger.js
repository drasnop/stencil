var logger = {
   // firebase for storing participant data
   "firebase": {},
   // firebase for storing trials data
   "firebaseTrials": {}
};

logger.initialize = function() {
   // get references to the appropriate data bases
   logger.firebase = new Firebase("https://incandescent-torch-4042.firebaseio.com/stencil-experiment/mturk/" + experiment.email);
   logger.firebaseTrials = new Firebase("https://incandescent-torch-4042.firebaseio.com/stencil-experiment/mturk/" + experiment.email + "/trials");

   // make sure the trials list is empty
   logger.firebaseTrials.set(null);

   // stores the full options and values sequences, just to be sure
   logger.firebase.child("/sequences").set({
      "optionsSequence": logger.flattenOptions(experiment.optionsSequence),
      "valuesSequence": experiment.valuesSequence
   })
}

logger.saveTrial = function() {
   logger.firebaseTrials.push(experiment.trial.loggable(), function(error) {
      if (error) {
         console.log("Trial " + experiment.trial.number + " could not be saved." + error);
      } else {
         console.log("Trial " + experiment.trial.number + " saved successfully.");
      }
   });
}


// -------------------- flatterners  ---------------------- //


// nothing will be stored if the array is empty (no empty arrays in Firebase)
logger.flattenArraysOfOptions = function(arr) {
   return arr.map(function(options) {
      return logger.flattenOptions(options);
   })
}

// nothing will be stored if the array is empty (no empty arrays in Firebase)
logger.flattenOptions = function(options) {
   return options.map(function(option) {
      return logger.flattenOption(option);
   })
}

// nothing will be stored if the array is empty (no empty arrays in Firebase)
logger.flattenTabs = function(tabs) {
   return tabs.map(function(tab) {
      return logger.flattenTab(tab);
   })
}

logger.flattenOption = function(option) {
   if ($.isEmptyObject(option))
      return {};

   // shallow copy
   var flattened = $.extend({}, option);

   // prevent infinite recursion by storing only option.id in that tab
   flattened["tab"] = logger.flattenTab(option["tab"]);

   // remove non-interesting data
   delete flattened["$$hashKey"];
   delete flattened["__proto__"];

   return flattened;
}

logger.flattenTab = function(tab) {
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
