var experiment = new Sequencer("experiment", 1000, Trial);

// whether the system is currently used to conduct an experiment
experiment.experiment = true;
// whether to use the opposite values of the default options for this participant
experiment.oppositeDefault = true;
// random sequence of 8 numbers and letters used to identify participants
experiment.email = "lotaculi";
// total number of trials in the experiment (starts at 1...)
experiment.numTrials = 8;
// list of options that users will be ask to find during the experiment
experiment.optionsSequence = [];
// list of values that the options should be set at during the experiment
experiment.valuesSequence = [];
// list of the labels of the values that the options should be set at during the experiment
experiment.valuesLabelsSequence = [];
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
   // label of the value that the target opion should be set at (string or "")
   this.targetValueLabel = experiment.valuesLabelsSequence[this.number];
   // id of the last selected option
   this.selectedOptionID = false;
   // last selected value of the last selected option
   this.selectedValue = false;

   this.success = function() {
      return this.selectedOptionID === this.targetOption.id && this.targetValue === this.selectedValue;
   };
}

/* overwritten methods */

experiment.endTrial = function() {
   experiment.trials.push(experiment.trial);
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
   var instructions = experiment.trial.targetOption.instructions;
   if(experiment.trial.targetOption.values.length > 0)
      instructions += " " + experiment.trial.targetValueLabel;
   else {
      // not a great solution but...
      if(!experiment.trial.targetValue)
         instructions = instructions.replace("Enable", "Disable")
   }
   return instructions;
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
   // so far, simply pick two options out of each tab
   model.tabs.forEach(function(tab) {
      experiment.optionsSequence.push(randomElementFrom(tab.options));
      experiment.optionsSequence.push(randomElementFrom(tab.options));
   });
   shuffleArray(experiment.optionsSequence);
   console.log("generated a random sequence of " + experiment.optionsSequence.length + " options")

   experiment.optionsSequence.forEach(function(option) {
      var value = complementValueOf(option);
      if(typeof value === "boolean") {
         experiment.valuesSequence.push(value);
         experiment.valuesLabelsSequence.push(value ? "true" : "false");
      }
      else {
         experiment.valuesSequence.push(value.name);
         experiment.valuesLabelsSequence.push(value.label);
      }
   })
}

function complementValueOf(option) {
   if(option.values.length === 0)
      return !option.value;

   // find current index
   var index;
   for(var i = 0; i < option.values.length; i++) {
      if(option.values[i].name === option.value) {
         index = i;
         break;
      }
   }
   index = (index + 1) % option.values.length;
   return option.values[index];
}

// cleaner return value for use elsewhere
experiment.complementValueOf = function(option) {
   var value = complementValueOf(option);
   return(typeof value === "boolean") ? value : value.name;
}
