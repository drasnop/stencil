var experiment = new Sequencer("experiment", 1000, 2000, "Wrong setting", false, Trial);

// whether the system is currently used to conduct an experiment
experiment.experiment = true;
// random sequence of 8 numbers and letters used to identify participants
experiment.email = "loticulo";
// 0=control, 1=minimal, 2=mixed, 3=highlighted (TODO make this affect optionsVisibility)
experiment.condition = "";
// whether to use the opposite values of the default options for this participant
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
      logger.initialize(experiment.generateInitialState);

      // tutorial.start() is independent of the preparation of the experiment
      setTimeout(tutorial.start.bind(tutorial), 1000);
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

   // randomly generate selection sequences
   experiment.generateOptionsAndValuesSequences();

   // save all of this generated data to firebase
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
   // reset options to their correct values, if necessary
   experiment.resetSettingsIfNeeded();

   model.progressBar.message = "";
   model.progressBar.buttonLabel = "Done";
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
   // in case participants got out of CM, bring them back in to save time
   if (!customizationMode)
      enterCustomizationMode();

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
   return this.trial.success;
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
      return sum += experiment.bonusTrial * trial.success;
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

// Generate a set of options to use in the recognition questionnaire, on the experiment website
experiment.generateRecognitionQuestionnaire = function() {

   // 1: retrieve all the trials, with their corrresponding options
   experiment.trials = pilotTrials; // DELETE THIS!
   var trials = $.extend([], experiment.trials)

   // 2a: filter out unsuccessful trials, unless they are less than 5 successful ones
   shuffleArray(trials);
   i = 0;
   while (i < trials.length && trials.length >= 5) {
      if (!trials[i].success)
         trials.splice(i, 1)
      else
         i++;
   }
   console.log("trials selected", trials)

   // 2b: pick 5 successful trials
   trials = trials.slice(0, 5);
   var options = trials.map(function(trial) {
      return trial.targetOption;
   })
   console.log("options selected", options)

   // 3
   var adjacentOptions = [];
   var adjacent;
   options.forEach(function(option) {
      if (option.index === 0) {
         // we must pick the option below the current one, unless it is in the selection sequence
         adjacent = option.tab.options[option.index + 1];
      }
   })

   //model.firebase.child("/optionsToRecognize").set({})
}


var pilotTrials = [{
   "changedOptions": ["smartlist_visibility_starred"],
   "changedValues": ["hidden"],
   "clickedOptions": ["smartlist_visibility_starred", "smartlist_visibility_starred"],
   "correctOptionHasBeenHighlighted": false,
   "correctOptionWasHighlightedWhenChanged": false,
   "highlightedHooks": [".detail-checkbox .checkBox, .taskItem-checkboxWrapper .checkBox", ".filters-collection .sidebarItem[rel='starred']", ".filters-collection .sidebarItem[rel='week']", ".filters-collection .sidebarItem[rel='all']"],
   "highlightedOptions": [
      ["sound_checkoff_enabled", "shortcut_mark_task_done"],
      ["smartlist_visibility_starred", "shortcut_goto_filter_starred"],
      ["smartlist_visibility_week", "shortcut_goto_filter_week", "today_smart_list_visible_tasks"],
      ["smartlist_visibility_all", "shortcut_goto_filter_all"]
   ],
   "instructionsDuration": 1.0641747645601463,
   "longDuration": 4.806236478719376,
   "number": 0,
   "reverseHighlighted": ["smartlist_visibility_starred", "smartlist_visibility_starred", "smartlist_visibility_starred", "smartlist_visibility_today"],
   "selectedOptions": [
      ["smartlist_visibility_starred", "shortcut_goto_filter_starred"]
   ],
   "shortDuration": 4.806236478719376,
   "success": false,
   "targetOption": "shortcut_goto_inbox",
   "targetValue": "CTRL + I",
   "time": {
      "correctOptionChanged": 0,
      "customizationMode": 19253.061699879334,
      "end": 24059.33120086822,
      "enterCustomizationMode": 19253.061699879334,
      "firstOptionChanged": 23110.79953161927,
      "instructionsShown": 18188.919957588696,
      "lastOptionChanged": 23110.79953161927,
      "start": 19253.094722148842
   },
   "timeout": false,
   "totalDuration": 5.870411243279523,
   "visitedTabs": [{
      "count": 1,
      "index": 2,
      "name": "Smart Lists",
      "options": ["smartlist_visibility_assigned_to_me", "smartlist_visibility_starred", "smartlist_visibility_today", "smartlist_visibility_week", "smartlist_visibility_all", "smartlist_visibility_done", "today_smart_list_visible_tasks"]
   }]
}, {
   "changedOptions": ["smartlist_visibility_today"],
   "changedValues": ["visible"],
   "clickedOptions": ["smartlist_visibility_today", "smartlist_visibility_today"],
   "correctOptionHasBeenHighlighted": false,
   "correctOptionWasHighlightedWhenChanged": true,
   "highlightedHooks": [".detail-checkbox .checkBox, .taskItem-checkboxWrapper .checkBox", ".filters-collection .sidebarItem[rel='all']", ".filters-collection .sidebarItem[rel='all']", ".filters-collection .sidebarItem[rel='week']", ".filters-collection .sidebarItem[rel='today']", ".filters-collection .sidebarItem[rel='week']"],
   "highlightedOptions": [
      ["sound_checkoff_enabled", "shortcut_mark_task_done"],
      ["smartlist_visibility_all", "shortcut_goto_filter_all"],
      ["smartlist_visibility_all", "shortcut_goto_filter_all"],
      ["smartlist_visibility_week", "shortcut_goto_filter_week", "today_smart_list_visible_tasks"],
      ["smartlist_visibility_today", "shortcut_goto_filter_today", "today_smart_list_visible_tasks"],
      ["smartlist_visibility_week", "shortcut_goto_filter_week", "today_smart_list_visible_tasks"]
   ],
   "instructionsDuration": 1.7210234047566373,
   "longDuration": 5.277463372055656,
   "number": 1,
   "panelExpanded": true,
   "reverseHighlighted": ["smartlist_visibility_starred", "smartlist_visibility_today", "smartlist_visibility_today", "smartlist_visibility_week"],
   "selectedOptions": [
      ["smartlist_visibility_today", "shortcut_goto_filter_today", "today_smart_list_visible_tasks"]
   ],
   "shortDuration": 4.269830319084373,
   "success": true,
   "targetOption": "smartlist_visibility_today",
   "targetValue": "visible",
   "time": {
      "correctOptionChanged": 32055.19315350179,
      "customizationMode": 27785.362834417418,
      "end": 33062.82620647307,
      "enterCustomizationMode": 0,
      "firstOptionChanged": 32055.19315350179,
      "instructionsShown": 26064.33942966078,
      "lastOptionChanged": 32055.19315350179,
      "start": 27785.362834417418
   },
   "timeout": false,
   "totalDuration": 6.998486776812293,
   "visitedTabs": [{
      "count": 2,
      "index": 2,
      "name": "Smart Lists",
      "options": ["smartlist_visibility_assigned_to_me", "smartlist_visibility_starred", "smartlist_visibility_today", "smartlist_visibility_week", "smartlist_visibility_all", "smartlist_visibility_done", "today_smart_list_visible_tasks"]
   }]
}, {
   "changedOptions": ["sound_notification_enabled"],
   "changedValues": [true],
   "clickedOptions": ["sound_notification_enabled"],
   "correctOptionHasBeenHighlighted": false,
   "correctOptionWasHighlightedWhenChanged": true,
   "highlightedHooks": [".filters-collection .sidebarItem[rel='assigned']", ".filters-collection .sidebarItem[rel='inbox']", "#main-toolbar .activities-count, .detail-reminder .wundercon.reminder", ".filters-collection .sidebarItem[rel='inbox']", ".filters-collection .sidebarItem[rel='assigned']", ".filters-collection .sidebarItem[rel='starred']"],
   "highlightedOptions": [
      ["smartlist_visibility_assigned_to_me", "shortcut_goto_filter_assigned"],
      ["shortcut_goto_inbox"],
      ["notifications_desktop_enabled", "notifications_email_enabled", "notifications_push_enabled", "sound_notification_enabled", "shortcut_show_notifications"],
      ["shortcut_goto_inbox"],
      ["smartlist_visibility_assigned_to_me", "shortcut_goto_filter_assigned"],
      ["smartlist_visibility_starred", "shortcut_goto_filter_starred"]
   ],
   "instructionsDuration": 1.2333411575287245,
   "longDuration": 5.556703699208177,
   "number": 2,
   "panelExpanded": true,
   "reverseHighlighted": ["notifications_email_enabled", "notifications_push_enabled", "notifications_push_enabled", "language", "date_format", "time_format", "sound_notification_enabled"],
   "selectedOptions": [
      ["notifications_desktop_enabled", "notifications_email_enabled", "notifications_push_enabled", "sound_notification_enabled", "shortcut_show_notifications"]
   ],
   "shortDuration": 4.592729656496995,
   "success": true,
   "targetOption": "sound_notification_enabled",
   "targetValue": true,
   "time": {
      "correctOptionChanged": 39894.492956439164,
      "customizationMode": 35301.76329994217,
      "end": 40858.46699915035,
      "enterCustomizationMode": 0,
      "firstOptionChanged": 39894.492956439164,
      "instructionsShown": 34068.422142413445,
      "lastOptionChanged": 39894.492956439164,
      "start": 35301.76329994217
   },
   "timeout": false,
   "totalDuration": 6.790044856736902,
   "visitedTabs": [{
      "count": 3,
      "description": "<strong>Notify me of important events via:</strong> <br> Stay in sync and get notified when items are added or completed in your shared lists. You can choose which lists you get notifications about, in each list's edit dialog.",
      "index": 3,
      "name": "Notifications",
      "options": ["notifications_email_enabled", "notifications_push_enabled", "notifications_desktop_enabled"]
   }, {
      "count": 1,
      "index": 0,
      "name": "General",
      "options": ["language", "date_format", "time_format", "start_of_week", "sound_checkoff_enabled", "sound_notification_enabled", "new_task_location", "confirm_delete_entity", "behavior_star_tasks_to_top", "print_completed_items"]
   }]
}, {
   "changedOptions": ["shortcut_goto_search"],
   "changedValues": ["CTRL + F"],
   "clickedOptions": ["shortcut_goto_search", "shortcut_goto_search"],
   "correctOptionHasBeenHighlighted": false,
   "correctOptionWasHighlightedWhenChanged": true,
   "highlightedHooks": ["#main-toolbar #search", ".filters-collection .sidebarItem[rel='inbox']"],
   "highlightedOptions": [
      ["shortcut_goto_search"],
      ["shortcut_goto_inbox"]
   ],
   "instructionsDuration": 1.5759422949227884,
   "longDuration": 3.9284215533675524,
   "number": 3,
   "panelExpanded": true,
   "reverseHighlighted": ["shortcut_add_new_list", "shortcut_mark_task_done", "shortcut_mark_task_starred", "shortcut_delete", "shortcut_goto_search", "shortcut_goto_search"],
   "selectedOptions": [
      ["shortcut_goto_search"]
   ],
   "shortDuration": 2.756252811355378,
   "success": true,
   "targetOption": "shortcut_goto_search",
   "targetValue": "CTRL + F",
   "time": {
      "correctOptionChanged": 46194.420396695634,
      "customizationMode": 43438.167585340256,
      "end": 47366.58913870781,
      "enterCustomizationMode": 0,
      "firstOptionChanged": 46194.420396695634,
      "instructionsShown": 41862.22529041747,
      "lastOptionChanged": 46194.420396695634,
      "start": 43438.167585340256
   },
   "timeout": false,
   "totalDuration": 5.504363848290341,
   "visitedTabs": [{
      "count": 1,
      "index": 1,
      "name": "Shortcuts",
      "options": ["shortcut_add_new_task", "shortcut_add_new_list", "shortcut_mark_task_done", "shortcut_mark_task_starred", "shortcut_select_all_tasks", "shortcut_delete", "shortcut_goto_search", "shortcut_goto_preferences", "shortcut_send_via_email", "shortcut_show_notifications", "shortcut_goto_inbox", "shortcut_goto_filter_assigned", "shortcut_goto_filter_starred", "shortcut_goto_filter_today", "shortcut_goto_filter_week", "shortcut_goto_filter_all", "shortcut_goto_filter_completed", "shortcut_sync"]
   }]
}, {
   "changedOptions": ["date_format"],
   "changedValues": ["DD.MM.YYYY"],
   "clickedOptions": ["date_format", "date_format", "date_format"],
   "correctOptionHasBeenHighlighted": false,
   "correctOptionWasHighlightedWhenChanged": true,
   "highlightedHooks": [".taskItem-duedate, .detail-date .token_0"],
   "highlightedOptions": [
      ["date_format", "start_of_week"]
   ],
   "instructionsDuration": 1.2677981107691885,
   "longDuration": 5.839443048187524,
   "number": 4,
   "panelExpanded": true,
   "reverseHighlighted": ["date_format", "date_format", "date_format", "date_format", "date_format", "date_format", "language"],
   "selectedOptions": [
      ["date_format", "start_of_week"]
   ],
   "shortDuration": 4.815150260251182,
   "success": true,
   "targetOption": "date_format",
   "targetValue": "DD.MM.YYYY",
   "time": {
      "correctOptionChanged": 54467.42085365244,
      "customizationMode": 49652.270593401256,
      "end": 55491.71364158878,
      "enterCustomizationMode": 0,
      "firstOptionChanged": 54467.42085365244,
      "instructionsShown": 48384.47248263207,
      "lastOptionChanged": 54467.42085365244,
      "start": 49652.270593401256
   },
   "timeout": false,
   "totalDuration": 7.107241158956713,
   "visitedTabs": [{
      "count": 2,
      "index": 0,
      "name": "General",
      "options": ["language", "date_format", "time_format", "start_of_week", "sound_checkoff_enabled", "sound_notification_enabled", "new_task_location", "confirm_delete_entity", "behavior_star_tasks_to_top", "print_completed_items"]
   }]
}, {
   "changedOptions": ["smartlist_visibility_week"],
   "changedValues": ["hidden"],
   "clickedOptions": ["smartlist_visibility_week", "smartlist_visibility_week"],
   "correctOptionHasBeenHighlighted": false,
   "correctOptionWasHighlightedWhenChanged": true,
   "highlightedHooks": [".filters-collection .sidebarItem[rel='week']", ".filters-collection .sidebarItem[rel='all']", ".filters-collection .sidebarItem[rel='completed']", ".filters-collection .sidebarItem[rel='all']", ".filters-collection .sidebarItem[rel='week']", ".filters-collection .sidebarItem[rel='today']", ".filters-collection .sidebarItem[rel='week']", ".filters-collection .sidebarItem[rel='all']"],
   "highlightedOptions": [
      ["smartlist_visibility_week", "shortcut_goto_filter_week", "today_smart_list_visible_tasks"],
      ["smartlist_visibility_all", "shortcut_goto_filter_all"],
      ["smartlist_visibility_done", "shortcut_goto_filter_completed"],
      ["smartlist_visibility_all", "shortcut_goto_filter_all"],
      ["smartlist_visibility_week", "shortcut_goto_filter_week", "today_smart_list_visible_tasks"],
      ["smartlist_visibility_today", "shortcut_goto_filter_today", "today_smart_list_visible_tasks"],
      ["smartlist_visibility_week", "shortcut_goto_filter_week", "today_smart_list_visible_tasks"],
      ["smartlist_visibility_all", "shortcut_goto_filter_all"]
   ],
   "instructionsDuration": 1.2818236503709195,
   "longDuration": 5.974889687769981,
   "number": 5,
   "panelExpanded": true,
   "reverseHighlighted": ["smartlist_visibility_assigned_to_me", "smartlist_visibility_starred", "smartlist_visibility_today", "smartlist_visibility_week", "smartlist_visibility_week", "smartlist_visibility_week", "smartlist_visibility_all", "smartlist_visibility_all"],
   "selectedOptions": [
      ["smartlist_visibility_week", "shortcut_goto_filter_week", "today_smart_list_visible_tasks"]
   ],
   "shortDuration": 4.659749691197154,
   "success": true,
   "targetOption": "smartlist_visibility_week",
   "targetValue": "hidden",
   "time": {
      "correctOptionChanged": 62451.383186845356,
      "customizationMode": 57791.6334956482,
      "end": 63766.52318341818,
      "enterCustomizationMode": 0,
      "firstOptionChanged": 62451.383186845356,
      "instructionsShown": 56509.80984527728,
      "lastOptionChanged": 62451.383186845356,
      "start": 57791.6334956482
   },
   "timeout": false,
   "totalDuration": 7.256713338140901,
   "visitedTabs": [{
      "count": 2,
      "index": 2,
      "name": "Smart Lists",
      "options": ["smartlist_visibility_assigned_to_me", "smartlist_visibility_starred", "smartlist_visibility_today", "smartlist_visibility_week", "smartlist_visibility_all", "smartlist_visibility_done", "today_smart_list_visible_tasks"]
   }]
}, {
   "changedOptions": ["shortcut_sync"],
   "changedValues": ["R"],
   "clickedOptions": ["shortcut_sync", "shortcut_sync"],
   "correctOptionHasBeenHighlighted": false,
   "correctOptionWasHighlightedWhenChanged": true,
   "highlightedHooks": [".addTask-input", "#main-toolbar #search", ".avatar, .name.search-hidden", ".avatar, .name.search-hidden", ".filters-collection .sidebarItem[rel='inbox']", ".filters-collection .sidebarItem[rel='assigned']", ".filters-collection .sidebarItem[rel='starred']"],
   "highlightedOptions": [
      ["new_task_location", "shortcut_add_new_task"],
      ["shortcut_goto_search"],
      ["shortcut_sync", "shortcut_goto_preferences"],
      ["shortcut_sync", "shortcut_goto_preferences"],
      ["shortcut_goto_inbox"],
      ["smartlist_visibility_assigned_to_me", "shortcut_goto_filter_assigned"],
      ["smartlist_visibility_starred", "shortcut_goto_filter_starred"]
   ],
   "instructionsDuration": 1.9344641824400024,
   "longDuration": 6.157185110347927,
   "number": 6,
   "panelExpanded": true,
   "reverseHighlighted": ["shortcut_add_new_list", "shortcut_mark_task_done", "shortcut_mark_task_starred", "shortcut_goto_preferences", "shortcut_goto_search", "shortcut_sync", "shortcut_sync"],
   "selectedOptions": [
      ["shortcut_sync", "shortcut_goto_preferences"]
   ],
   "shortDuration": 4.973641088985212,
   "success": true,
   "targetOption": "shortcut_sync",
   "targetValue": "R",
   "time": {
      "correctOptionChanged": 71692.35561235783,
      "customizationMode": 66718.71452337262,
      "end": 72875.89963372055,
      "enterCustomizationMode": 0,
      "firstOptionChanged": 71692.35561235783,
      "instructionsShown": 64784.25034093262,
      "lastOptionChanged": 71692.35561235783,
      "start": 66718.71452337262
   },
   "timeout": false,
   "totalDuration": 8.09164929278793,
   "visitedTabs": [{
      "count": 1.5,
      "index": 1,
      "name": "Shortcuts",
      "options": ["shortcut_add_new_task", "shortcut_add_new_list", "shortcut_mark_task_done", "shortcut_mark_task_starred", "shortcut_select_all_tasks", "shortcut_delete", "shortcut_goto_search", "shortcut_goto_preferences", "shortcut_send_via_email", "shortcut_show_notifications", "shortcut_goto_inbox", "shortcut_goto_filter_assigned", "shortcut_goto_filter_starred", "shortcut_goto_filter_today", "shortcut_goto_filter_week", "shortcut_goto_filter_all", "shortcut_goto_filter_completed", "shortcut_sync"]
   }]
}, {
   "changedOptions": ["start_of_week"],
   "changedValues": ["sun"],
   "clickedOptions": ["start_of_week", "start_of_week"],
   "correctOptionHasBeenHighlighted": false,
   "correctOptionWasHighlightedWhenChanged": true,
   "highlightedHooks": [".taskItem-duedate, .detail-date .token_0"],
   "highlightedOptions": [
      ["date_format", "start_of_week"]
   ],
   "instructionsDuration": 1.5435153187630786,
   "longDuration": 5.797316895978059,
   "number": 7,
   "panelExpanded": true,
   "reverseHighlighted": ["date_format", "time_format", "start_of_week", "start_of_week"],
   "selectedOptions": [
      ["date_format", "start_of_week"]
   ],
   "shortDuration": 4.636852317270823,
   "success": true,
   "targetOption": "start_of_week",
   "targetValue": "sun",
   "time": {
      "correctOptionChanged": 80064.92044310531,
      "customizationMode": 75428.06812583448,
      "end": 81225.38502181254,
      "enterCustomizationMode": 0,
      "firstOptionChanged": 80064.92044310531,
      "instructionsShown": 73884.5528070714,
      "lastOptionChanged": 80064.92044310531,
      "start": 75428.06812583448
   },
   "timeout": false,
   "totalDuration": 7.3408322147411385,
   "visitedTabs": [{
      "count": 2,
      "index": 0,
      "name": "General",
      "options": ["language", "date_format", "time_format", "start_of_week", "sound_checkoff_enabled", "sound_notification_enabled", "new_task_location", "confirm_delete_entity", "behavior_star_tasks_to_top", "print_completed_items"]
   }]
}, {
   "changedOptions": ["notifications_email_enabled"],
   "changedValues": [true],
   "clickedOptions": ["notifications_email_enabled"],
   "correctOptionHasBeenHighlighted": false,
   "correctOptionWasHighlightedWhenChanged": true,
   "highlightedHooks": [".detail-checkbox .checkBox, .taskItem-checkboxWrapper .checkBox", ".filters-collection .sidebarItem[rel='inbox']", ".avatar, .name.search-hidden", "#main-toolbar .activities-count, .detail-reminder .wundercon.reminder", ".filters-collection .sidebarItem[rel='inbox']", ".filters-collection .sidebarItem[rel='assigned']", ".filters-collection .sidebarItem[rel='starred']", ".filters-collection .sidebarItem[rel='today']"],
   "highlightedOptions": [
      ["sound_checkoff_enabled", "shortcut_mark_task_done"],
      ["shortcut_goto_inbox"],
      ["shortcut_sync", "shortcut_goto_preferences"],
      ["notifications_desktop_enabled", "notifications_email_enabled", "notifications_push_enabled", "sound_notification_enabled", "shortcut_show_notifications"],
      ["shortcut_goto_inbox"],
      ["smartlist_visibility_assigned_to_me", "shortcut_goto_filter_assigned"],
      ["smartlist_visibility_starred", "shortcut_goto_filter_starred"],
      ["smartlist_visibility_today", "shortcut_goto_filter_today", "today_smart_list_visible_tasks"]
   ],
   "instructionsDuration": 1.28048178598714,
   "longDuration": 3.6607260793819734,
   "number": 8,
   "panelExpanded": true,
   "reverseHighlighted": ["notifications_desktop_enabled", "notifications_push_enabled", "notifications_email_enabled"],
   "selectedOptions": [
      ["notifications_desktop_enabled", "notifications_email_enabled", "notifications_push_enabled", "sound_notification_enabled", "shortcut_show_notifications"]
   ],
   "shortDuration": 2.559663208550803,
   "success": true,
   "targetOption": "notifications_email_enabled",
   "targetValue": true,
   "time": {
      "correctOptionChanged": 86072.60838444348,
      "customizationMode": 83512.94517589267,
      "end": 87173.67125527465,
      "enterCustomizationMode": 0,
      "firstOptionChanged": 86072.60838444348,
      "instructionsShown": 82232.46338990553,
      "lastOptionChanged": 86072.60838444348,
      "start": 83512.94517589267
   },
   "timeout": false,
   "totalDuration": 4.941207865369114,
   "visitedTabs": [{
      "count": 3,
      "description": "<strong>Notify me of important events via:</strong> <br> Stay in sync and get notified when items are added or completed in your shared lists. You can choose which lists you get notifications about, in each list's edit dialog.",
      "index": 3,
      "name": "Notifications",
      "options": ["notifications_email_enabled", "notifications_push_enabled", "notifications_desktop_enabled"]
   }]
}, {
   "changedOptions": ["shortcut_show_notifications"],
   "changedValues": ["CTRL + SHIFT + A"],
   "clickedOptions": ["shortcut_show_notifications", "shortcut_show_notifications"],
   "correctOptionHasBeenHighlighted": false,
   "correctOptionWasHighlightedWhenChanged": true,
   "highlightedHooks": [".filters-collection .sidebarItem[rel='starred']", ".filters-collection .sidebarItem[rel='assigned']", ".filters-collection .sidebarItem[rel='inbox']", ".avatar, .name.search-hidden", ".filters-collection .sidebarItem[rel='inbox']", ".avatar, .name.search-hidden", "#main-toolbar .activities-count, .detail-reminder .wundercon.reminder", ".filters-collection .sidebarItem[rel='inbox']", ".filters-collection .sidebarItem[rel='assigned']", ".filters-collection .sidebarItem[rel='starred']"],
   "highlightedOptions": [
      ["smartlist_visibility_starred", "shortcut_goto_filter_starred"],
      ["smartlist_visibility_assigned_to_me", "shortcut_goto_filter_assigned"],
      ["shortcut_goto_inbox"],
      ["shortcut_sync", "shortcut_goto_preferences"],
      ["shortcut_goto_inbox"],
      ["shortcut_sync", "shortcut_goto_preferences"],
      ["notifications_desktop_enabled", "notifications_email_enabled", "notifications_push_enabled", "sound_notification_enabled", "shortcut_show_notifications"],
      ["shortcut_goto_inbox"],
      ["smartlist_visibility_assigned_to_me", "shortcut_goto_filter_assigned"],
      ["smartlist_visibility_starred", "shortcut_goto_filter_starred"]
   ],
   "instructionsDuration": 2.8923795311908616,
   "longDuration": 7.328916530412622,
   "number": 9,
   "panelExpanded": true,
   "reverseHighlighted": ["notifications_email_enabled", "notifications_push_enabled", "shortcut_show_notifications", "shortcut_show_notifications", "shortcut_show_notifications"],
   "selectedOptions": [
      ["notifications_desktop_enabled", "notifications_email_enabled", "notifications_push_enabled", "sound_notification_enabled", "shortcut_show_notifications"]
   ],
   "shortDuration": 6.2291928464839295,
   "success": true,
   "targetOption": "shortcut_show_notifications",
   "targetValue": "CTRL + SHIFT + A",
   "time": {
      "correctOptionChanged": 97309.15716458298,
      "customizationMode": 91079.96431809905,
      "end": 98408.88084851168,
      "enterCustomizationMode": 0,
      "firstOptionChanged": 97309.15716458298,
      "instructionsShown": 88187.58478690819,
      "lastOptionChanged": 97309.15716458298,
      "start": 91079.96431809905
   },
   "timeout": false,
   "totalDuration": 10.221296061603484,
   "visitedTabs": [{
      "count": 3,
      "description": "<strong>Notify me of important events via:</strong> <br> Stay in sync and get notified when items are added or completed in your shared lists. You can choose which lists you get notifications about, in each list's edit dialog.",
      "index": 3,
      "name": "Notifications",
      "options": ["notifications_email_enabled", "notifications_push_enabled", "notifications_desktop_enabled"]
   }, {
      "count": 0.5,
      "index": 1,
      "name": "Shortcuts",
      "options": ["shortcut_add_new_task", "shortcut_add_new_list", "shortcut_mark_task_done", "shortcut_mark_task_starred", "shortcut_select_all_tasks", "shortcut_delete", "shortcut_goto_search", "shortcut_goto_preferences", "shortcut_send_via_email", "shortcut_show_notifications", "shortcut_goto_inbox", "shortcut_goto_filter_assigned", "shortcut_goto_filter_starred", "shortcut_goto_filter_today", "shortcut_goto_filter_week", "shortcut_goto_filter_all", "shortcut_goto_filter_completed", "shortcut_sync"]
   }]
}]
