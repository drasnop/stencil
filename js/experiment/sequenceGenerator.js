/*
 *  Helpers for generating (option,value) sequences and recognition questionnaires
 */

var sequenceGenerator = (function() {

   var sequenceGenerator = {};

   sequenceGenerator.numOptionsPerTab = {
      "General": 5,
      "Shortcuts": 10,
      "Smart Lists": 3,
      "Notifications": 2
   }

   sequenceGenerator.optionsPartition = [{
         'General': ['date_format',
            'start_of_week',
            'sound_notification_enabled',
            'new_task_location',
            'print_completed_items'
         ],
         'Shortcuts': ['shortcut_add_new_task',
            'shortcut_mark_task_starred',
            'shortcut_select_all_tasks',
            'shortcut_copy_tasks',
            'shortcut_goto_search',
            'shortcut_show_notifications',
            'shortcut_goto_filter_assigned',
            'shortcut_goto_filter_today',
            'shortcut_goto_filter_all',
            'shortcut_sync'
         ],
         'Smart Lists': ['smartlist_visibility_today',
            'smartlist_visibility_all',
            'today_smart_list_visible_tasks'
         ],
         'Notifications': ['notifications_email_enabled',
            'notifications_desktop_enabled'
         ]
      }, {
         'General': ['time_format',
            'sound_checkoff_enabled',
            'confirm_delete_entity',
            'behavior_star_tasks_to_top',
            'show_subtask_progress'
         ],
         'Shortcuts': ['shortcut_add_new_list',
            'shortcut_mark_task_done',
            'shortcut_delete',
            'shortcut_paste_tasks',
            'shortcut_goto_preferences',
            'shortcut_send_via_email',
            'shortcut_goto_inbox',
            'shortcut_goto_filter_starred',
            'shortcut_goto_filter_week',
            'shortcut_goto_filter_completed'
         ],
         'Smart Lists': ['smartlist_visibility_assigned_to_me',
            'smartlist_visibility_week',
            'smartlist_visibility_done'
         ],
         'Notifications': ['notifications_push_enabled',
            'notifications_desktop_enabled'
         ]
      }


   ]

   sequenceGenerator.generateOptionsAndValuesSequences = function(callback) {

      // create the target option sequence, by randomly ordering two blocks of options from the same partition
      generateOptionsSequence();
      generateOptionsSequence();

      // create the target values sequence by taking the complement of the current target options' values
      experiment.optionsSequence.forEach(function(option) {
         // if oppositeDefaults, set the reverse flag to make sure the complementValue found here is the opposite of the opposite default (hence the default)
         var value = sequenceGenerator.complementValueOf(option, experiment.oppositeDefaults);
         experiment.valuesSequence.push(value);
      })

      // add a fixed practice trial at the beginning, with a fixed target value
      experiment.optionsSequence.unshift(model.options["smartlist_visibility_starred"]);
      experiment.valuesSequence.unshift("hidden");

      // callback to tell logger that the initial state is ready to be logged
      callback();
   }

   function generateOptionsSequence() {

      // 1a: retrieve the correct options partition
      var partition = sequenceGenerator.optionsPartition[experiment.partition]

      // 1b: replace option_IDs by references to actual options, creating a new array
      var optionsInTab = [];
      for (var tabName in partition) {
         optionsInTab[tabName] = partition[tabName].map(function(option_ID) {
            return model.options[option_ID];
         })
      }

      // 2: shuffle the options in each tab
      for (var tabName in optionsInTab) {
         shuffleArray(optionsInTab[tabName]);
      }

      // 3: compute a sequence of tabs in which no two selections come from the same tab
      var tabSequence = generateTabsSequenceWithoutConsecutiveTabs(sequenceGenerator.numOptionsPerTab);

      // 4: use this sequence to order the sequence of options selections
      for (var i = 0; i < tabSequence.length; i++) {
         experiment.optionsSequence.push(optionsInTab[tabSequence[i]].pop())
      }

      console.log("generated a random sequence of " + experiment.optionsSequence.length + " options")
   }


   // returns a boolean value or a String (the name of the value)
   // in the case of more than 2 values, the reverse flag is used so that complementValueOf(complementValueOf(option),true)=option.valuesequenceGenerator.complementValueOf = function(option, reverse) {
   sequenceGenerator.complementValueOf = function(option, reverse) {

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


   // Generate a set of options to use in the recognition questionnaire, on the experiment website
   sequenceGenerator.generateRecognitionQuestionnaire = function(callback) {
      // 0: TESTING ONLY
      /*   for (var j = 0; j < 10; j++) {
            experiment.trials.push({
               "targetOption": experiment.optionsSequence[j],
               "success": Math.random() < 0.5
            })
         }
      */

      // 1: Generate option candidates from the target options of all the experiment trials
      var options = experiment.trials.map(function(trial) {
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

         // set flags: valid iff not target option and hasn't been selected as adjacent before
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
         else {
            console.log("Success! Options to recognize saved in database")

            // Once we know the questionnaires have been succesfully generated, move on to finish experiment and destroy account
            callback();
         }
      })

   }

   return sequenceGenerator;
})();
