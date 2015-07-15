/*
 * Subclass of Sequencer that guide users through a sequence of timed trials
 */

var TrialsSequencer = (function() {

   function TrialsSequencer(name, firstTrialNumber, trialPauseSuccess, trialPauseFailure, errorMessage, forceRetry, trialConstructor, endCallback) {

      // list of all the trials completed so far for the experiment
      // used to compute current reward, and to generate questionnaires options at the end.
      this.trials = [];
      // timeout trials after 2 min
      this.maxTrialDuration = 2 * 60 * 1000;

      Sequencer.call(this, name, firstTrialNumber, trialPauseSuccess, trialPauseFailure, errorMessage, forceRetry, trialConstructor, endCallback)
   }

   // subclass extends superclass
   TrialsSequencer.prototype = Object.create(Sequencer.prototype);
   TrialsSequencer.prototype.constructor = TrialsSequencer;

   /* overwritten methods */

   TrialsSequencer.prototype.start = function() {

      // reset options to their correct values, if necessary
      resetSettingsIfNeeded();

      // refresh preferences panel - annoying workaround to update the Backbone view
      if (experiment.condition === 0)
         closePreferences();

      // listen to changes of the Backbone model
      wunderlistListeners.bindSettingsAndTabsListeners();

      Sequencer.prototype.start.call(this);
   }

   TrialsSequencer.prototype.initializeTrial = function(number) {
      // open the preferences panel or enter customization mode, in case participants had closed them
      if (experiment.condition === 0 && !preferencesOpen)
         openPreferences();
      if (experiment.condition > 0 && !customizationMode)
         enterCustomizationMode();

      // hide the hooks / settings panel, to prevent people from planning their next actions
      // workaround to make sure the style is applied to the settings panel, which has just been created
      $("head").append("<style class='hidden-settings-style'> #settings .content, #settings .content-footer, #hooks {visibility: hidden}</style>");

      if (experiment.condition > 0) {
         // make sure the details panel is visible
         openDetailsPanel();

         // (re)create hooks and clusters for the customization layer, don't animate
         setTimeout(function() {
            hooksManager.generateHooks();
            hooksManager.updateHooksAndClusters(false);
         }, 500)
      }

      Sequencer.prototype.initializeTrial.call(this, number, (function() {

         // once the .trial has been initialized, we can start using it
         this.trial.time.instructionsShown = performance.now();

         if (this.name == "practiceTrial")
            addExplanatoryPopups();

         // set how the options should look like if this trial was perfectly executed
         experiment.referenceOptions[this.trial.targetOption.id].value = this.trial.targetValue;
      }).bind(this));
   }

   TrialsSequencer.prototype.startTrial = function() {
      // ensure there is always at least one visited tab for Wunderlist
      if (experiment.condition === 0) {
         this.trial.visitedTabs.pushStamped({
            "tab": logger.flattenTab(wunderlistListeners.findActiveTab(window.location.hash))
         })
      }

      // show the hooks / settings panel
      $(".hidden-settings-style").remove();

      // starts measuring duration
      this.trial.time.start = performance.now();

      // set timer for timeout
      this.timeoutTimer = setTimeout(this.onTimeout.bind(this), this.maxTrialDuration);

      Sequencer.prototype.startTrial.call(this);
   }

   TrialsSequencer.prototype.onTimeout = function() {
      console.log("timeout!")
      this.trial.timeout = true;

      // we must ask angular to $apply() after all the variables are set
      this.endTrial(function() {
         angular.element($("#ad-hoc-panel")).scope().$apply();
      });
   }

   TrialsSequencer.prototype.endTrial = function(callback) {
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
      resetSettingsIfNeeded();

      // refresh preferences panel - annoying workaround to update the Backbone view
      if (experiment.condition === 0)
         closePreferences();

      Sequencer.prototype.endTrial.call(this, callback);
   }


   /* methods that need to be implemented */

   TrialsSequencer.prototype.getModalHeader = function() {
      return "Please change the following setting: (" + (this.trial.number + 1) + " / " + experiment.optionsSequence.length + ")";
   }

   TrialsSequencer.prototype.getInstructions = function() {
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

   TrialsSequencer.prototype.trialNotPerformed = function() {
      return this.trial.changedOptions.length === 0;
   }

   TrialsSequencer.prototype.trialSuccess = function() {
      return this.trial.success;
   }

   TrialsSequencer.prototype.getCurrentReward = function() {
      return this.trials.reduce(function(sum, trial) {
         return sum += experiment.bonusTrial * trial.success;
      }, 0)
   }

   TrialsSequencer.prototype.notEndOfSequence = function() {
      return this.trial.number + 1 < experiment.optionsSequence.length;
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

   // explain how CM works with a few popups, triggered by various timers and listeners
   function addExplanatoryPopups() {

      correctHookNotSelectedTimer = setTimeout(function() {
         alert("Hint: Left-click on the \"Assigned to me\" smart filter, in the left sidebar, to bring up the settings associated with it.")
      }, 30 * 1000)

      // watcher for correct hook selected
      model.watch("selectedOptions", function(prop, oldval, newval) {

         // if model.selectedOptions is empty, do nothing
         if (newval.length === 0)
            return newval;

         // small timeout to ensure the options panel will appear before the alert popup
         setTimeout(function() {

            // check if this is the correct hook
            if (newval.indexOf(experiment.sequencer.trial.targetOption) < 0) {
               alert("The setting you are looking for is not associated with this item. Try to click on another one!")
            } else {

               // since the correct hook has been selected, clean up explanatory popups
               clearTimeout(correctHookNotSelectedTimer);
               model.unwatch("selectedOptions");

               alert("Good job! You have found an item related to the setting you have to change!")

               setTimeout(function() {
                  if (experiment.condition == 3)
                     alert("In this panel, the settings highlighted in *orange* are related to the item you clicked on.\nChange the appropriate one.")
                  else
                     alert("The settings in this orange popup are related to the item you clicked on.\nChange the appropriate one.")
               }, 1000)
            }

         }, 50)

         /*         //  watcher for changed option
                  experiment.sequencer.trial.changedOptions.watch("length", function(prop, oldval, newval) {

                     setTimeout(function() {
                        var trial = experiment.sequencer.trial;
                        console.log(trial.changedOptions.length)

                        // check if this is the correct option
                        if (trial.changedOptions[trial.changedOptions.length - 1].option_ID != trial.targetOption.id) {
                           alert("Sorry, this isn't the correct setting. Try another one!")
                        } else {
                           // check if this is the correct value
                           if (trial.changedOptions[trial.changedOptions.length - 1].newValue != trial.targetValue) {
                              alert("This is the setting you're looking for, but you haven't given it the correct value. Try again!")
                           } else {

                              // since the option has been sucessfully changed, clean up explanatory popups
                              trial.unwatch("changedOptions");

                              alert("Well done! Click the \"Next\" button to finish the trial.")
                           }
                        }

                     }, 100)
                  })*/

         return newval;
      })
   }

   return TrialsSequencer;

})();
