/*
 * Handle the connection to Firebase for logging information throughout the experiment.
 * Define methods for "flattening" options and tabs, i.e. replace pointers by string ids.
 */

var logger = (function() {

   var logger = {
      // firebase for storing participant data
      "firebase": {}
   };

   // if the Wunderlist email appears in Firebase, initialize the logger; other cancel experiment
   logger.checkEmail = function(callbackSuccess, callbackError, messageEmailUnknown, messageExperimentAlreadyCompleted) {
      var mturk = new Firebase("https://incandescent-torch-4042.firebaseio.com/stencil-experiment/mturk/");

      mturk.once('value', function(snapshot) {
         if (!snapshot.hasChild(experiment.email)) {
            console.log("Failure! MTurk firebase doesn't contain", experiment.email)
            callbackError(messageEmailUnknown);
         } else if (snapshot.child(experiment.email).child('/trials').numChildren() >= 41) {
            console.log("Failure! User " + experiment.email + " has already completed the experiment")
            callbackError(messageExperimentAlreadyCompleted);
         } else {
            console.log("Success! MTurk firebase contains", experiment.email)
            callbackSuccess();
         }
      });
   }

   // connects to the appropriate Firebase, and retrieve key information
   logger.initialize = function(callback) {
      logger.firebase = new Firebase("https://incandescent-torch-4042.firebaseio.com/stencil-experiment/mturk/" + experiment.email);
      console.log("Initializing logging to " + logger.firebase.toString() + "...")

      logger.firebase.once('value', function(snapshot) {
         experiment.pid = parseInt(snapshot.child("pid").val());
         experiment.oppositeDefaults = false;
         experiment.condition = experiment.conditions[experiment.pid][0];
         model.optionsVisibility = experiment.condition;
         console.log("Success! Participant: " + experiment.email + "  pid: " + experiment.pid);

         callback();
      })
   }

   // store participant info, options and values sequences, and prepare trials logging
   logger.saveInitialState = function() {
      // save the screen resolution, OS and browser
      logger.firebase.child("/info/apparatus").set({
         "screenWidth": screen.width,
         "screenHeight": screen.height,
         "innerWidth": window.innerWidth,
         "innerHeight": window.innerHeight,
         "os": navigator.platform,
         "browser": Browser.name,
         "version": Browser.version,
         "numSettings": sync.collections.settings.models.length
      })

      // make sure the trials list is empty
      logger.firebase.child("/tutorial").set(null);
      logger.firebase.child("/tutorial").set(null);
      logger.firebase.child("/questionnaires/intermediate").set(null);

      // save the full options and values sequences, just to be sure
      logger.firebase.child("/sequences").set({
         "optionsSequence": logger.getIDs(experiment.optionsSequence),
         "valuesSequence": experiment.valuesSequence
      })
   }

   // save a loggable version of experiment.sequencer.trial
   logger.saveTrial = function(loggableTrial) {
      logger.firebase.child("/trials").push(loggableTrial, function(error) {
         if (error) {
            console.log("Trial " + experiment.sequencer.trial.number + " (external number: " + experiment.sequencer.getExternalTrialNumber() + ")" + " could not be saved." + error);
         } else {
            console.log("Trial " + experiment.sequencer.trial.number + " (external number: " + experiment.sequencer.getExternalTrialNumber() + ")" + " saved successfully.");
         }
      });
   }


   // -------------------- flatterners  ---------------------- //

   // to use less storage space, in some cases options are simply stored as ids
   logger.getIDs = function(options) {
      return options.map(function(option) {
         return option.id;
      })
   }


   // Recursive flattening, preserving some of the structure 

   logger.compressAllUserAccessibleOptions = function() {
      var compressed = {};
      model.options.forEachUserAccessible(function(option) {
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
      return compress(option, "tab", logger.flattenTab);
   }

   logger.flattenTab = function(tab) {
      if (tab.bloat)
         return compressBloatTab(tab);
      else
         return compress(tab, "options", function(option) {
            return option.id;
         });
   }

   logger.compressTab = function(tab) {
      if (tab.bloat)
         return compressBloatTab(tab);
      else
         return compress(tab, "options", logger.flattenOption);
   }

   logger.flattenOption = function(option) {
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

   function compressBloatTab(tab) {
      var loggable = $.extend({}, tab);

      // remove too long html data
      delete loggable["description"];

      // remove non-interesting data
      delete loggable["$$hashKey"];
      delete loggable["__proto__"];

      return loggable;
   }

   return logger;
})();
