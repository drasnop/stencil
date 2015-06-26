/*
 * Static class to handle the set up, initialization and flow of the usabiity experiment.
 * It calls the tutorial and trials sequencers.
 */

var experiment = {
   // random sequence of 8 numbers and letters used to identify participants (read from Wunderlist app if possible)
   "email": "lotaculi",
   // 0=control, 1=minimal, 2=mixed, 3=highlighted (set by logger.initialize)
   "condition": "",
   // whether to use the opposite values of the default options for this participant (set by logger.initialize)
   "oppositeDefaults": "",
   // bonus reward when trial done correctly
   "bonusTrial": 0.15,
   // list of options that users will be ask to find during the experiment
   "optionsSequence": [],
   // list of values that the options should be set at during the experiment
   "valuesSequence": []
}

/*
CALLBACK HELL
experiment.initialize
   logger.checkEmail
      logger.initialize
         experiment.generateInitialState
            experiment.generateOptionsAndValuesSequences
            logger.saveInitialState
*/

experiment.initialize = function() {

   // retrieve the email used to create that Wunderlist account, otherwise a default email ("lotaculi") will be used
   if (typeof sync !== "undefined" && typeof sync.collections !== "undefined")
      experiment.email = sync.collections.users.models[0].get("email").split("@")[0];

   // prepare error messages for the error callbacks
   var messageEmailUnknown = "The email associated with this Wunderlist account (" + experiment.email + "@gmail.com) does not match the email you were given on the instructions page. " +
      "Please go back to step 2 of the instructions (Create temporary Wunderlist account). Otherwise you won't be able to collect your reward.";
   var messageExperimentAlreadyCompleted = "You can only participate in this experiment once. Please go back to the instructions page, and complete the questionnaires.";

   // verify that this email appears in firebase
   logger.checkEmail(function() {
      logger.initialize(function() {
         experiment.generateInitialState();

         // tutorial.start() is independent of the preparation of the experiment
         tutorial.start();
         //setTimeout(experimentTrials.start.bind(experimentTrials), 1000);
      });

      // if the email doesn't appear in firebase, cancel experiment
   }, experiment.cancel, messageEmailUnknown, messageExperimentAlreadyCompleted);
}


experiment.generateInitialState = function() {
   // 1: for some participants, use the opposite of the default options
   if (experiment.oppositeDefaults) {
      model.options.getUserAccessibleOptions().forEach(function(option) {
         option.value = experiment.complementValueOf(option);
      });
   }

   // 2: store a correct version of the options, for future reference
   // the use of the logger method is coincidential: it simply serves our purpose here well
   experiment.referenceOptions = logger.compressAllUserAccessibleOptions();

   // 3: set the Wunderlist options to the default (or opposite default) settings 
   dataManager.initializeAppOptionsFromFile();

   // 4: randomly generate selection sequences
   experiment.generateOptionsAndValuesSequences();

   // 5: save all of this generated data to firebase
   logger.saveInitialState();
}


experiment.cancel = function(message) {
   model.progressBar.message = "";
   model.modal.header = "Verification failed!";
   model.modal.message = message;
   model.modal.buttonLabel = "Ok";
   model.modal.green = false;
   model.modal.hideOnClick = false;
   model.modal.action = function() {
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.deleteAccount();
   }

   showModal();
}






/*    helpers for generating options sequences and questionnaires   */


experiment.generateOptionsAndValuesSequences = function() {
   // select one third of options per tab, with a maximum of 4
   var numOptionsPerTab = {
      "General": 3,
      "Shortcuts": 4,
      "Smart Lists": 2,
      "Notifications": 1
   }

   // 1: randomly pick an appropriate number of options in each tab, respecting some constraints
   var optionsInTab = [];
   model.tabs.forEachNonBloat(function(tab) {
      // get options from this tab, excluding the forbidden options
      var allowedOptions = tab.options.filter(function(option) {
         return typeof option.notInExperiment === "undefined";
      })

      // randomly pick numOptionsPerTab[t] options      
      shuffleArray(allowedOptions);
      optionsInTab[tab.name] = allowedOptions.slice(0, numOptionsPerTab[tab.name]);
   });

   // 2: compute a sequence of tabs in which no two selections come from the same tab
   var tabSequence = generateTabsSequenceWithoutConsecutiveTabs(numOptionsPerTab);

   // 3: use this sequence to order the sequence of options selections
   for (var i = 0; i < tabSequence.length; i++) {
      experiment.optionsSequence.push(optionsInTab[tabSequence[i]].pop())
   }

   console.log("generated a random sequence of " + experiment.optionsSequence.length + " options")

   experiment.optionsSequence.forEach(function(option) {
      // if oppositeDefaults, set the reverse flag to make sure the complementValue found here is the opposite of the opposite default (hence the default)
      var value = experiment.complementValueOf(option, experiment.oppositeDefaults);
      experiment.valuesSequence.push(value);
   })
}


// returns a boolean value or a String (the name of the value)
// in the case of more than 2 values, the reverse flag is used so that complementValueOf(complementValueOf(option),true)=option.value
experiment.complementValueOf = function(option, reverse) {

   // do not touch options that aren't part of the experiment
   if (option.notInExperiment)
      return option.value;

   // if it's a boolean option, flip it
   if (!option.values)
      return !option.value;

   // otherwise, for more than two values, find current index
   var index = getIndexOfValueInOption(option, option.value);

   // find a complement value
   if (reverse)
      index = (index - 1 + option.values.length) % option.values.length;
   else
      index = (index + 1) % option.values.length;

   return option.values[index].name;
}

experiment.getTotalTrialsReward = function() {
   return experimentTrials.trials.reduce(function(sum, trial) {
      return sum += experiment.bonusTrial * trial.success;
   }, 0)
}

experiment.resetSettingsIfNeeded = function() {
   for (var id in experiment.referenceOptions) {
      if (experiment.referenceOptions[id].value !== model.options[id].value) {
         console.log("- rectifying:", id, experiment.referenceOptions[id].value)

         // update both my model and Wunderlist settings
         model.options[id].value = experiment.referenceOptions[id].value;
         dataManager.updateAppOption(id, model.options[id].value, true);
      }
   }
}

// Generate a set of options to use in the recognition questionnaire, on the experiment website
experiment.generateRecognitionQuestionnaire = function() {

   // 0: TESTING ONLY
   /*   for (var j = 0; j < 10; j++) {
         experimentTrials.trials.push({
            "targetOption": experiment.optionsSequence[j],
            "success": Math.random() < 0.5
         })
      }
   */

   // 1: Generate option candidates from the target options of all the trials
   var options = experimentTrials.trials.map(function(trial) {
      var option = $.extend({}, trial.targetOption);
      option.successfullySelected = trial.success;
      return option;
   })

   // 2a: sort options to consider first the ones at the top or bottom of a tab for finding ajacents
   options.sort(function(optionA, optionB) {
      var aShouldGoFirst = (optionA.index === 0 || optionA.index === optionA.tab.options.length - 1);
      var bShouldGoFirst = (optionB.index === 0 || optionB.index === optionB.tab.options.length - 1);
      return bShouldGoFirst - aShouldGoFirst;
   })

   // 2b: pick the best adjacent option (best effort), setting a .adjacent.valid flag if constraints are verified
   options.forEach(function(option) {
      if (option.index === 0) {
         // must pick the option below the current one
         option.adjacentOption = option.tab.options[option.index + 1];
      } else if (option.index === option.tab.options.length - 1) {
         // must pick the option above the current one
         option.adjacentOption = option.tab.options[option.index - 1];
      } else {
         // can pick either the option above or below the current one
         var above = option.tab.options[option.index - 1];
         var below = option.tab.options[option.index + 1];

         option.adjacentOption = (pickAbove(above, below) ? above : below);
      }

      // set flags: valide iff not target option and hasn't been selected as adjacent before
      option.adjacentOption.valid = (experiment.optionsSequence.indexOf(option.adjacentOption) < 0 && !option.adjacentOption.adjacent);
      option.adjacentOption.adjacent = true;


      /* helper function */
      function pickAbove(above, below) {
         // if one (and only one) of these appeared in the target options sequence, pick the other one
         if (experiment.optionsSequence.indexOf(below) >= 0 && experiment.optionsSequence.indexOf(above) < 0)
            return true;
         if (experiment.optionsSequence.indexOf(above) >= 0 && experiment.optionsSequence.indexOf(below) < 0)
            return false;

         // otherwise, if one (and only one) has already been picked as ajacent, pick the other one
         if (!above.adjacent && below.adjacent)
            return true;
         if (above.adjacent && !below.adjacent)
            return false;

         // just use random!
         console.log("Using random to pick an adjacent option", experiment.optionsSequence.indexOf(above) < 0, experiment.optionsSequence.indexOf(below) < 0, above.adjacent, below.adjacent)
         return Math.random() < 0.5;
      }
   })

   // 3: select the 5 most appropriate options
   shuffleArray(options);
   var filtered = [];

   // 3a: get all the good ones first
   i = 0;
   while (i < options.length && filtered.length < 5) {
      if (options[i].successfullySelected && options[i].adjacentOption.valid)
         filtered.push(options.splice(i, 1)[0])
      else
         i++;
   }

   // 3b: if necessary, also get some for which the ajacent constraint is not verified
   var countAdjacentInvalid = 0;
   if (filtered.length < 5) {
      i = 0;
      while (i < options.length && filtered.length < 5) {
         if (options[i].successfullySelected) {
            filtered.push(options.splice(i, 1)[0])
            countAdjacentInvalid++;
         } else
            i++;
      }
   }

   // 3c: get the number of necessary bad ones (not successfully selected)
   var countNotSuccessfullySelected = 0;
   while (filtered.length < 5) {
      filtered.push(options.pop())
      countNotSuccessfullySelected++;
   }

   // 4: prepare storage in Firebase
   var loggable = [];
   filtered.forEach(function(option) {
      // indicate that this option is one of the adjacent ones + if its base option was successfully selected
      option.adjacentOption.referenceOption = option.id;
      loggable.push(logger.compressOption(option.adjacentOption));

      // compressOption has created a deep copy of the adjacent option, so we can replace it by just its id
      option.adjacentOption = option.adjacentOption.id;
      loggable.push(logger.compressOption(option));
   });
   console.log("options with invalid adjacent option:", countAdjacentInvalid, "options not successfully selected:", countNotSuccessfullySelected)

   logger.firebase.child("/questionnaires/recognition/optionsToRecognize").set(loggable, function(error) {
      if (error)
         console.log("Error! Options to recognize not saved in database")
      else
         console.log("Success! Options to recognize saved in database")
   })
}
