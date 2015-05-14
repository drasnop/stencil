var experiment = new Sequencer("experiment", 1000, 3000, "Wrong setting", false, Trial);

// whether the system is currently used to conduct an experiment
experiment.experiment = true;
// whether to use the opposite values of the default options for this participant
experiment.oppositeDefault = false;
// random sequence of 8 numbers and letters used to identify participants
experiment.email = "localhost";
// bonus reward when trial done correctly
experiment.bonusTrial = ".1";
// timeout trials after 2 min
experiment.maxTrialDuration = 2 * 60 * 1000;
// list of options that users will be ask to find during the experiment
experiment.optionsSequence = [];
// list of values that the options should be set at during the experiment
experiment.valuesSequence = [];
// list of all the trials completed so far
experiment.trials = [];


experiment.initialize = function() {
   // retrieve participant's email; otherwise just use 'localhost' as a placeholder
   if (typeof sync !== "undefined" && typeof sync.collections !== "undefined")
      experiment.email = sync.collections.users.models[0].get("email").split("@")[0];

   experiment.generateOptionsAndValuesSequences();

   // store participant info, options and values sequences, and prepare trials logging
   logger.initialize();

   setTimeout(tutorial.start.bind(tutorial), 1000);
   //setTimeout(experiment.start.bind(experiment), 1000);
}


/* overwritten methods */

experiment.start = function() {
   Sequencer.prototype.start.call(this);
}

experiment.initializeTrial = function(number) {
   Sequencer.prototype.initializeTrial.call(this, number, function() {
      experiment.trial.time.instructionsShown = performance.now();
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

   experiment.trials.push(experiment.trial);
   logger.saveTrial();

   Sequencer.prototype.endTrial.call(this, callback);
}

experiment.end = function() {
   Sequencer.prototype.end.call(this);

   model.progressBarMessage = "";
   model.modal.header = "Congratulations!";
   model.modal.message = "You have completed the experiment. Please go back to the instructions page to answer a questionnaire and get your bonus reward code.";
   model.modal.green = true;
   model.modal.hideOnClick = false;
   model.modal.action = function() {
      experiment.experiment = false;
      setTimeout(exitCustomizationMode, 10);
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
      // if oppositeDefault, set the reverse flag to make sure the complementValue found here is the opposite of the opposite default (hence the default)
      var value = experiment.complementValueOf(option, experiment.oppositeDefault);
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
