var experiment = new Sequencer("experiment", 1000, Trial);

// whether the system is currently used to conduct an experiment
experiment.experiment = true;
// whether to use the opposite values of the default options for this participant
experiment.oppositeDefault = true;
// random sequence of 8 numbers and letters used to identify participants
experiment.email = "lotaculi";
// firebase for storing data
experiment.firebase = new Firebase("https://incandescent-torch-4042.firebaseio.com/stencil-experiment/mturk/" + experiment.email + "/trials");
// list of options that users will be ask to find during the experiment
experiment.optionsSequence = [];
// list of values that the options should be set at during the experiment
experiment.valuesSequence = [];
// list of all the trials completed so far
experiment.trials = [];


function Trial(number) {
   // trial number, starting at 0
   this.number = number;
   // whether the done button has been pressed, marking the end of the trial
   this.done = false;
   // target option id
   // target option (Object)
   this.targetOption = experiment.optionsSequence[this.number];
   // value that the target opion should be set at (boolean or string)
   this.targetValue = experiment.valuesSequence[this.number];
   // id of the last selected option
   this.selectedOptionID = false;
   // last selected value of the last selected option
   this.selectedValue = false;

   this.success = function() {
      return this.selectedOptionID === this.targetOption.id && this.targetValue === this.selectedValue;
   };

   this.loggable = function() {
      return {
         "number": this.number,
         "targetOption": this.targetOption.id,
         "targetValue": this.targetValue,
         "selectedOption": this.selectedOptionID,
         "selectedValue": this.selectedValue,
         "success": this.success()
      }
   }
}

/* overwritten methods */

experiment.start = function() {
   experiment.firebase.set(null);
   Sequencer.prototype.start.call(this);
}

experiment.endTrial = function() {
   experiment.trials.push(experiment.trial);
   experiment.firebase.push(experiment.trial.loggable());
   Sequencer.prototype.endTrial.call(this);
}

experiment.end = function() {
   Sequencer.prototype.end.call(this);
   // launch questionnaires
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
   return !experiment.trial.selectedOptionID;
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
