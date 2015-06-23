var experiment = new Sequencer("experiment", 1000, 2000, "Wrong setting", false, Trial);

// random sequence of 8 numbers and letters used to identify participants (read from Wunderlist app if possible)
experiment.email = "lotaculi";
// 0=control, 1=minimal, 2=mixed, 3=highlighted (set by logger.initialize)
experiment.condition = "";
// whether to use the opposite values of the default options for this participant (set by logger.initialize)
experiment.oppositeDefaults = "";
// bonus reward when trial done correctly
experiment.bonusTrial = 0.15;
// timeout trials after 2 min
experiment.maxTrialDuration = 2 * 60 * 1000;
// list of options that users will be ask to find during the experiment
experiment.optionsSequence = [];
// list of values that the options should be set at during the experiment
experiment.valuesSequence = [];
// list of all the trials completed so far
experiment.trials = [];

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
         // tutorial.start();
         setTimeout(experiment.start.bind(experiment), 1000);
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

/* overwritten methods */

experiment.start = function() {
   // close customization panel
   if (experiment.condition > 0) {
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.closePanel();
   }

   // reset options to their correct values, if necessary
   experiment.resetSettingsIfNeeded();

   // in control conditions, listen to changes of the Backbone model
   if (experiment.condition === 0)
      bindWunderlistListeners();

   model.modal.header = "Experiment";
   model.modal.message = "In each step, you will be asked to change <b>one setting</b> of Wunderlist. Take your time to read the instructions, then click \"Go!\" to begin. Please change the setting <b>as quickly and as accurately as possible</b>, then click the \"Next\" button.<br><br>" +
      "You won't be able to change your mind after clicking \"Next\". You will get an extra <b>$" + experiment.bonusTrial + "</b> for each setting correctly changed.";
   model.modal.buttonLabel = "Start";
   model.modal.green = true;
   model.modal.hideOnClick = false;
   model.modal.action = (function() {
      Sequencer.prototype.start.call(this);
   }).bind(this);

   showModal();
}

experiment.initializeTrial = function(number) {
   // open the preferences panel or enter customization mode, in case participants had closed them
   if (experiment.condition > 0 && !customizationMode)
      enterCustomizationMode();
   if (experiment.condition === 0 && !preferencesOpen)
      openPreferences();

   // hide the hooks, to prevent people from planning their next actions
   $("#hooks").hide();

   Sequencer.prototype.initializeTrial.call(this, number, function() {
      // once the .trial has been initialized, we can start using it
      experiment.trial.time.instructionsShown = performance.now();

      // set how the options should look like if this trial was perfectly executed
      experiment.referenceOptions[experiment.trial.targetOption.id].value = experiment.trial.targetValue;
   });
}

experiment.startTrial = function() {
   // ensure there is always at least one visited tab for Wunderlist
   if (experiment.condition === 0)
      processWunderlistTab(window.location.hash);

   // show the hooks
   $("#hooks").show();

   experiment.trial.time.start = performance.now();

   experiment.timeoutTimer = setTimeout(function() {
      console.log("timeout!")
      experiment.trial.timeout = true;

      // we must ask angular to $apply() after all the variables are set
      experiment.endTrial(function() {
         angular.element($("#ad-hoc-panel")).scope().$apply();
      });
   }, experiment.maxTrialDuration);

   Sequencer.prototype.startTrial.call(this);
}

experiment.endTrial = function(callback) {
   experiment.trial.time.end = performance.now();
   experiment.trial.success = experiment.trial.successful();

   // if the trial hasn't timeout, disable the timer 
   clearTimeout(experiment.timeoutTimer);

   // close customization panel
   if (experiment.condition > 0) {
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.closePanel();
   }

   // log
   experiment.trials.push(experiment.trial);
   logger.saveTrial();

   // reset options to their correct values, if necessary
   experiment.resetSettingsIfNeeded();

   Sequencer.prototype.endTrial.call(this, callback);
}

experiment.end = function() {
   Sequencer.prototype.end.call(this);

   experiment.generateRecognitionQuestionnaire();

   model.progressBar.message = "";
   model.modal.header = "Congratulations!";
   model.modal.message = "You have completed the experiment. Please go back to the instructions page to answer a questionnaire and get your verification code.";
   model.modal.buttonLabel = "Ok";
   model.modal.green = true;
   model.modal.hideOnClick = false;
   model.modal.action = function() {
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.deleteAccount();
   }

   showModal();
}

/* methods that need to be implemented */

experiment.getModalHeader = function() {
   return "Please change the following setting: (" + (this.trial.number + 1) + " / " + this.optionsSequence.length + ")";
}

experiment.getInstructions = function() {
   var option = experiment.trial.targetOption,
      value = experiment.trial.targetValue;

   // Check for explicit instructions for the "false" or values[1] case
   if (option.instructionsReverse) {
      // we must retrieve the label of the value, since we're storing only the string name of targetValues
      if ((typeof value === "boolean" && value) || (typeof value !== "boolean" && getIndexOfValueInOption(option, value) === 0))
         return option.instructions;
      else
         return option.instructionsReverse;
   }

   // Standard cases
   var instructions = option.instructions;

   // Other booleans: simply replace enable by disable
   if (!option.values) {
      if (value)
         return instructions;
      else
         return instructions.replace("Enable", "Disable")
   }

   // Non-booleans options (more than 2 values)

   // special case for show/hide
   if (option.id.indexOf("smartlist_") >= 0) {
      if (value === "visible" || value === "auto")
         return instructions;
      else
         return instructions.replace("show", "hide")
   }

   // Otherwise, simply build the instructions from the value labels
   var index = getIndexOfValueInOption(option, value);
   return instructions + " " + option.values[index].label;
}

experiment.trialNotPerformed = function() {
   return experiment.trial.changedOptions.length === 0;
}

experiment.trialSuccess = function() {
   return this.trial.success;
}

experiment.notEndOfSequence = function() {
   return this.trial.number + 1 < this.optionsSequence.length;
}




// -------------------------------------------- //



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
   return experiment.trials.reduce(function(sum, trial) {
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
         experiment.trials.push({
            "targetOption": experiment.optionsSequence[j],
            "success": Math.random() < 0.5
         })
      }
   */

   // 1: retrieve all the trials, with their corrresponding options
   var trials = $.extend([], experiment.trials)

   // 2: turn these trials into option candidates
   var options = trials.map(function(trial) {
      var option = $.extend({}, trial.targetOption);
      option.successfullySelected = trial.success;
      return option;
   })

   // 3a: sort options to consider first the ones at the top or bottom of a tab for finding ajacents
   options.sort(function(optionA, optionB) {
      var aShouldGoFirst = (optionA.index === 0 || optionA.index === optionA.tab.options.length - 1);
      var bShouldGoFirst = (optionB.index === 0 || optionB.index === optionB.tab.options.length - 1);
      return bShouldGoFirst - aShouldGoFirst;
   })

   // 3b: pick the best adjacent option (best effort), setting a .adjacent.valid flag if constraints are verified
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

   // 4: select the 5 most appropriate options
   shuffleArray(options);
   var filtered = [];

   // 4a: get all the good ones first
   i = 0;
   while (i < options.length && filtered.length < 5) {
      if (options[i].successfullySelected && options[i].adjacentOption.valid)
         filtered.push(options.splice(i, 1)[0])
      else
         i++;
   }

   // 4b: if necessary, also get some for which the ajacent constraint is not verified
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

   // 4c: get the number of necessary bad ones (not successfully selected)
   var countNotSuccessfullySelected = 0;
   while (filtered.length < 5) {
      filtered.push(options.pop())
      countNotSuccessfullySelected++;
   }

   // 5: prepare storage in Firebase
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
