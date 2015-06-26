/*
 * Instance of Sequencer that guide users through a sequence of timed trials
 */

var experimentTrials = new Sequencer("experimentTrials", 1000, 2000, "Wrong setting", false, Trial);

// list of all the trials completed so far for the experiment
// Used to compute current reward, and to generate questionnaires options at the end.
experimentTrials.trials = [];
// timeout trials after 2 min
experimentTrials.maxTrialDuration = 2 * 60 * 1000;


/* overwritten methods */

experimentTrials.start = function() {

   // reset options to their correct values, if necessary
   experimentTrials.resetSettingsIfNeeded();

   // in control conditions, listen to changes of the Backbone model
   if (experiment.condition === 0)
      bindWunderlistListeners();

   Sequencer.prototype.start.call(this);
}

experimentTrials.initializeTrial = function(number) {
   // open the preferences panel or enter customization mode, in case participants had closed them
   if (experiment.condition > 0 && !customizationMode)
      enterCustomizationMode();
   if (experiment.condition === 0 && !preferencesOpen)
      openPreferences();

   // hide the hooks, to prevent people from planning their next actions
   $("#hooks").hide();

   Sequencer.prototype.initializeTrial.call(this, number, (function() {

      // once the .trial has been initialized, we can start using it
      this.trial.time.instructionsShown = performance.now();

      // set how the options should look like if this trial was perfectly executed
      experiment.referenceOptions[this.trial.targetOption.id].value = this.trial.targetValue;
   }).bind(this));
}

experimentTrials.startTrial = function() {
   // ensure there is always at least one visited tab for Wunderlist
   if (experiment.condition === 0)
      processWunderlistTab(window.location.hash);

   // show the hooks
   $("#hooks").show();

   // starts measuring duration
   this.trial.time.start = performance.now();

   // set timer for timeout
   this.timeoutTimer = setTimeout(this.onTimeout.bind(this), this.maxTrialDuration);

   Sequencer.prototype.startTrial.call(this);
}

experimentTrials.onTimeout = function() {
   console.log("timeout!")
   this.trial.timeout = true;

   // we must ask angular to $apply() after all the variables are set
   this.endTrial(function() {
      angular.element($("#ad-hoc-panel")).scope().$apply();
   });
}

experimentTrials.endTrial = function(callback) {
   this.trial.time.end = performance.now();
   this.trial.success = this.trial.successful();

   // if the trial hasn't timeout, disable the timer 
   clearTimeout(this.timeoutTimer);

   // close customization panel
   if (experiment.condition > 0) {
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.closePanel();
   }

   // log
   this.trials.push(this.trial);
   logger.saveTrial();

   // reset options to their correct values, if necessary
   experimentTrials.resetSettingsIfNeeded();

   Sequencer.prototype.endTrial.call(this, callback);
}

experimentTrials.end = function() {
   Sequencer.prototype.end.call(this);

   sequenceGenerator.generateRecognitionQuestionnaire();

   experiment.experimentTrialsEnded();
}


/* methods that need to be implemented */

experimentTrials.getModalHeader = function() {
   return "Please change the following setting: (" + (this.trial.number + 1) + " / " + experiment.optionsSequence.length + ")";
}

experimentTrials.getInstructions = function() {
   var option = this.trial.targetOption,
      value = this.trial.targetValue;

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

experimentTrials.trialNotPerformed = function() {
   return this.trial.changedOptions.length === 0;
}

experimentTrials.trialSuccess = function() {
   return this.trial.success;
}

experimentTrials.notEndOfSequence = function() {
   return this.trial.number + 1 < experiment.optionsSequence.length;
}


/* for display */

experimentTrials.getTotalTrialsReward = function() {
   return this.trials.reduce(function(sum, trial) {
      return sum += experiment.bonusTrial * trial.success;
   }, 0)
}

// this could actually be a private method
experimentTrials.resetSettingsIfNeeded = function() {
   for (var id in experiment.referenceOptions) {
      if (experiment.referenceOptions[id].value !== model.options[id].value) {
         console.log("- rectifying:", id, experiment.referenceOptions[id].value)

         // update both my model and Wunderlist settings
         model.options[id].value = experiment.referenceOptions[id].value;
         dataManager.updateAppOption(id, model.options[id].value, true);
      }
   }
}
