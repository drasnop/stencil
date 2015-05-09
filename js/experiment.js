var experiment = new Sequencer("experiment", 1000, Trial);

// whether the system is currently used to conduct an experiment
experiment.experiment = true;
// whether to use the opposite values of the default options for this participant
experiment.oppositeDefault = true;
// random sequence of 8 numbers and letters used to identify participants
experiment.email = "lotaculi";
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

   if (experiment.trial.targetOption.values.length > 0) {
      // we must retrieve the label of the value, since we're sorting only the string name of targetValues
      var index = getIndex(experiment.trial.targetOption, experiment.trial.targetValue);
      instructions += " " + experiment.trial.targetOption.values[index].label;
   } else {
      // not a great solution but...
      if (!experiment.trial.targetValue)
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
   // select one third of options per tab, with a maximum of 4
   var numOptionsPerTab = [3, 4, 2, 1];
   var optionsByTab = [];
   var firstAllowedIndex = [1, 2, 0, 0];
   var numTrials = 0;

   for (var i = 0; i < model.tabs.length; i++) {
      // select numOptionsPerTab at random, excluding the forbidden options
      var allowedOptions = model.tabs[i].options.slice(firstAllowedIndex[i])
      shuffleArray(allowedOptions);

      optionsByTab[i] = [];
      for (var j = 0; j < numOptionsPerTab[i]; j++) {
         optionsByTab[i].push(allowedOptions[j]);
         //optionsByTab[i].push(model.options["date_format"]);
         //console.log(optionsByTab[i])
      }
      numTrials += numOptionsPerTab[i];
   }

   //console.log(optionsByTab)
   // prevent options from the same tab from following each other
   var tabIndex = Math.floor(Math.random() * 4);
   for (var i = 0; i < numTrials; i++) {
      //console.log(optionsByTab)
      experiment.optionsSequence.push(optionsByTab[tabIndex].pop())
      tabIndex = randomTabIndexExcluding(optionsByTab, tabIndex);
   }

   console.log("generated a random sequence of " + experiment.optionsSequence.length + " options")

   experiment.optionsSequence.forEach(function(option) {
      // if oppositeDefault, set the reverse flag to make sure the complementValue found here is the opposite of the opposite default (hence the default)
      var value = experiment.complementValueOf(option, experiment.oppositeDefault);
      experiment.valuesSequence.push(value);
   })
}

function randomTabIndexExcluding(optionsByTab, prev) {
   // add the indexes of the tabs that still have options to pick from, excluding the prev tab
   var indexes = [];
   for (var i = 0; i < optionsByTab.length; i++) {
      if (i != prev && optionsByTab[i].length > 0)
         indexes.push(i);
   }
   return randomElementFrom(indexes);
}


// returns a boolean value or a String (the name of the value)
// in the case of more than 2 values, the reverse flag is used so that complementValueOf(complementValueOf(option),true)=option.value
experiment.complementValueOf = function(option, reverse) {

   // do not touch options that aren't part of the experiment
   if (typeof option.notInExperiment !== "undefined" && option.notInExperiment)
      return option.value;

   // if it's a boolean option, flip it
   if (option.values.length === 0)
      return !option.value;

   // otherwise, for more than two values, find current index
   var index = getIndex(option, option.value);

   // find a complement value
   if (reverse)
      index = (index - 1 + option.values.length) % option.values.length;
   else
      index = (index + 1) % option.values.length;

   return option.values[index].name;
}
