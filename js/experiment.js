var experiment = new Sequencer("experiment", 1000, 2000, "Wrong setting", false, Trial);

// whether the system is currently used to conduct an experiment
experiment.experiment = true;
// random sequence of 8 numbers and letters used to identify participants
experiment.email = "lotaculi";
// 0=control, 1=minimal, 2=mixed, 3=highlighted (TODO make this affect optionsVisibility)
experiment.condition = "";
// whether to use the opposite values of the default options for this participant
experiment.oppositeDefaults = "";
// bonus reward when trial done correctly
experiment.bonusTrial = 0.1;
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
            logger.saveInitialState
*/

experiment.initialize = function() {

   // retrieve the email used to create that Wunderlist account, otherwise a default email ("lotaculi") will be used
   if (typeof sync !== "undefined" && typeof sync.collections !== "undefined")
      experiment.email = sync.collections.users.models[0].get("email").split("@")[0];

   // verify that this email appears in firebase
   logger.checkEmail(function() {
      logger.initialize(experiment.generateInitialState);

      // tutorial.start() is independent of the preparation of the experiment
      setTimeout(tutorial.start.bind(tutorial), 1000);
   }, experiment.cancel);
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

   // randomly generate selection sequences
   experiment.generateOptionsAndValuesSequences();

   // save all of this generated data to firebase
   logger.saveInitialState();
}


experiment.cancel = function() {
   model.progressBarMessage = "";
   model.modal.header = "Verification failed!";
   model.modal.message = "The email associated with this Wunderlist account (" + experiment.email + "@gmail.com) does not match the email you were given on the instructions page. " +
      "Please go back to step 2 of the instructions (Create temporary Wunderlist account). Otherwise you won't be able to collect your reward.";
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
   // reset options to their correct values, if necessary
   experiment.resetSettingsIfNeeded();

   model.progressBarMessage = "";
   model.modal.header = "Experiment";
   model.modal.message = "In each step, you will be asked to change one setting of Wunderlist. Take your time to read the instructions, then click \"Go!\" to begin. Please change the setting as quickly and as accurately as possible, then click the \"Done\" button. You won't be able to change your mind after clicking \"Done\". You will get an extra $" + experiment.bonusTrial + " for each correct setting changed.";
   model.modal.buttonLabel = "Start";
   model.modal.green = true;
   model.modal.hideOnClick = false;
   model.modal.action = (function() {
      Sequencer.prototype.start.call(this);
   }).bind(this);

   showModal();
}

experiment.initializeTrial = function(number) {
   Sequencer.prototype.initializeTrial.call(this, number, function() {
      experiment.trial.time.instructionsShown = performance.now();

      // set how the options should look like if this trial was perfectly executed
      experiment.referenceOptions[experiment.trial.targetOption.id].value = experiment.trial.targetValue;
   });
}

experiment.startTrial = function() {
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

   // if the trial hasn't timeout, disable the timer 
   clearTimeout(experiment.timeoutTimer);

   // close customization panel
   var scope = angular.element($("#ad-hoc-panel")).scope();
   scope.closePanel();

   // log
   experiment.trials.push(experiment.trial);
   logger.saveTrial();

   // reset options to their correct values, if necessary
   experiment.resetSettingsIfNeeded();

   Sequencer.prototype.endTrial.call(this, callback);
}

experiment.end = function() {
   Sequencer.prototype.end.call(this);

   model.progressBarMessage = "";
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
   if (option.values.length === 0) {
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
   return this.trial.success();
}

experiment.notEndOfSequence = function() {
   return this.trial.number + 1 < this.optionsSequence.length;
}




// -------------------------------------------- //



experiment.generateOptionsAndValuesSequences = function() {
   // select one third of options per tab, with a maximum of 4
   var numOptionsPerTab = [3, 4, 2, 1];

   // 1: randomly pick an appropriate number of options in each tab, respecting some constraints
   var optionsInTab = [];
   for (var t = 0; t < model.tabs.length; t++) {
      // get options from tab t, excluding the forbidden options
      var allowedOptions = model.tabs[t].options.filter(function(option) {
         return typeof option.notInExperiment === "undefined";
      })

      // randomly pick numOptionsPerTab[t] options      
      shuffleArray(allowedOptions);
      optionsInTab[t] = allowedOptions.slice(0, numOptionsPerTab[t]);
   }

   // 2: compute a sequence of tabs in which no two selections come from the same tab
   var tabIndexesSequence = generateTabsSequenceWithoutConsecutiveTabs(numOptionsPerTab);

   // 3: use this sequence to order the sequence of options selections
   for (var i = 0; i < tabIndexesSequence.length; i++) {
      experiment.optionsSequence.push(optionsInTab[tabIndexesSequence[i]].pop())
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
   if (option.values.length === 0)
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
      return sum += experiment.bonusTrial * trial.success();
   }, 0)
}

experiment.resetSettingsIfNeeded = function() {
   var syncNeeded = false;
   for (var id in experiment.referenceOptions) {
      if (experiment.referenceOptions[id].value !== model.options[id].value) {
         console.log("- rectifying:", id, experiment.referenceOptions[id].value)
         model.options[id].value = experiment.referenceOptions[id].value;
         syncNeeded = true;
      }
   }
   if (syncNeeded)
      dataManager.initializeAppOptionsFromFile();
}
