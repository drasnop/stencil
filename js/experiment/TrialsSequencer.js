/*
 * Subclass of Sequencer that guide users through a sequence of timed trials
 */

var TrialsSequencer = (function() {

   function TrialsSequencer(name, trialPauseSuccess, trialPauseFailure, timeoutMinutes, errorMessage, forceRetry, trialConstructor, startIndex, endIndex, endCallback) {

      // which indices in the general target options sequence this sequencer covers
      this.startIndex = startIndex;
      this.endIndex = endIndex;

      // list of options and values that users will be ask to change during this phase of the experiment
      this.optionsSequence = experiment.optionsSequence.slice(startIndex, endIndex + 1);
      this.valuesSequence = experiment.valuesSequence.slice(startIndex, endIndex + 1);

      // timeout trials after a few minutes
      this.maxTrialDuration = 60 * 1000 * timeoutMinutes;

      Sequencer.call(this, name, trialPauseSuccess, trialPauseFailure, errorMessage, forceRetry, trialConstructor, endCallback)
   }

   // subclass extends superclass
   TrialsSequencer.prototype = Object.create(Sequencer.prototype);
   TrialsSequencer.prototype.constructor = TrialsSequencer;

   TrialsSequencer.prototype.getExternalTrialNumber = function() {
      return this.startIndex + this.trial.number;
   }

   /* overwritten methods */

   TrialsSequencer.prototype.initializeTrial = function(number) {
      // open the preferences panel or enter customization mode, in case participants had closed them
      if (experiment.condition === 0 && !preferencesOpen) {
         exitCustomizationMode();
         openPreferences();
      }
      if (experiment.condition > 0 && !customizationMode)
         enterCustomizationMode();

      // always start from the general tab (for internal and ecological validity)
      if (experiment.condition === 0)
         window.location.hash = "#/preferences/general";

      // ensure that all hooks are available in customization mode
      if (experiment.condition > 0) {
         // make sure the details panel is visible
         openDetailsPanel();

         // (re)create hooks and clusters for the customization layer, don't animate
         setTimeout(function() {
            hooksManager.generateHooks();
            hooksManager.updateHooksAndClusters(false);
         }, 500)
      }

      // hide the hooks / settings panel, to prevent people from planning their next actions
      // workaround to make sure the style is applied to the settings panel, which has just been created
      $("head").append("<style class='hidden-settings-style'> #settings .content, #settings .content-footer, #hooks {visibility: hidden}</style>");

      // reset options to their correct values, if necessary
      resetSettingsIfNeeded();

      // Initialize this.trial and show the instructions modal
      Sequencer.prototype.initializeTrial.call(this, number, (function() {

         // once the .trial has been initialized, we can start using it
         this.trial.time.instructionsShown = performance.now();

         // set how the options should look like at the end of this trial, if it was perfectly executed
         experiment.referenceOptions[this.trial.target.option.id].value = this.trial.target.value;
      }).bind(this));
   }

   TrialsSequencer.prototype.startTrial = function() {
      var timestamp = performance.now();

      // ensure there is always at least one visited tab for Wunderlist
      if (experiment.condition === 0) {
         this.trial.visitedTabs.pushStamped({
            "tab": logger.flattenTab(wunderlistListeners.findActiveTab())
         }, timestamp)
      }

      // refresh preferences panel - workaround to update the Backbone view
      if (experiment.condition === 0)
         wunderlistListeners.rectifyUIifNeeded();

      // show the hooks / settings panel
      $(".hidden-settings-style").remove();

      // add popups to practice trial
      if (this.name == "practiceTrial" && experiment.condition > 0)
         tutorial.addExplanatoryPopups();

      // starts measuring duration
      this.trial.time.start = timestamp;

      // set timer for timeout
      this.timeoutTimer = setTimeout(this.onTimeout.bind(this), this.maxTrialDuration);

      Sequencer.prototype.startTrial.call(this);
   }

   TrialsSequencer.prototype.onTimeout = function() {
      console.log("timeout!")
      this.trial.timeout = true;
      this.endTrial();
   }

   TrialsSequencer.prototype.endTrial = function() {
      this.trial.time.end = performance.now();
      this.trial.success = this.trial.successful();

      // if the trial hasn't timeout, disable the timer 
      clearTimeout(this.timeoutTimer);

      // close customization panel (which reverts it to minimal)
      if (experiment.condition > 0) {
         var scope = angular.element($("#ad-hoc-panel")).scope();
         scope.closePanel();
      }

      // log
      var loggable = this.trial.loggable();
      experiment.trials.push(loggable);
      logger.saveTrial(loggable);

      Sequencer.prototype.endTrial.call(this);
   }


   /* methods that need to be implemented */

   TrialsSequencer.prototype.getModalHeader = function() {
      return "Please change the following setting: (" + (this.trial.number + 1) + " / " + this.optionsSequence.length + ")";
   }

   TrialsSequencer.prototype.getInstructions = function() {
      var option = this.trial.target.option,
         value = this.trial.target.value;

      // Check for explicit instructions for the "false" or values[1] case
      if (option.instructionsReverse) {
         // we must retrieve the label of the value, since we're storing only the string name of target values
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

   TrialsSequencer.prototype.trialNotPerformed = function() {
      return this.trial.changedOptions.length === 0;
   }

   TrialsSequencer.prototype.trialSuccess = function() {
      return this.trial.success;
   }

   TrialsSequencer.prototype.getCurrentReward = function() {
      return experiment.trials.filter(function(trial) {
         return trial.number > 0 && trial.success;
      }).length * experiment.bonusTrial;
   }

   TrialsSequencer.prototype.notEndOfSequence = function() {
      return this.trial.number + 1 < this.optionsSequence.length;
   }


   /* helper function */


   function resetSettingsIfNeeded() {
      for (var id in experiment.referenceOptions) {
         if (experiment.referenceOptions[id].value !== model.options[id].value) {
            console.log("- rectifying:", id, experiment.referenceOptions[id].value)

            // update both my model and Wunderlist settings
            model.options[id].value = experiment.referenceOptions[id].value;
            dataManager.updateAppOption(id, model.options[id].value, true);
         }
      }

      // we must even rectify the appearance of the damn lists!
      if (experiment.condition === 0)
         wunderlist.forceVisibilityOfSmartlists();
      else
         wunderlist.restoreVisibilityOfSmartlists();
   }

   // if possible, make sure the details panel on the right-hand side is opened
   function openDetailsPanel() {
      if (typeof sync != "undefined" && typeof sync.collections != "undefined") {

         // first, try to get the one we know has a due date
         var tasks = sync.collections.tasks.where({
            title: "watch a good movie"
         });

         // otherwise, just pick any task available
         if (!tasks.length) {
            tasks = sync.collections.tasks.models;
         }

         // if we've found at least one suitable task, get its id and use it to show the panel
         if (tasks.length > 0) {
            var task_id = tasks[0].get("online_id")
            window.location.hash = "#/tasks/" + task_id;
         }
      }
   }

   return TrialsSequencer;

})();
