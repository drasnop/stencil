var experiment = {
   // whether the system is currently used to conduct an experiment
   "experiment": true,
   // whether to use the opposite values of the default options for this participant
   "oppositeDefault": true,
   // random sequence of 8 numbers and letters used to identify participants
   "email": "lotaculi",
   // list of options that users will be ask to find during the experiment
   "optionsSequence": [],
   // list of values that the options should be set at during the experiment
   "valuesSequence": [],
   // list of the labels of the values that the options should be set at during the experiment
   "valuesLabelsSequence": [],
   // current trial
   "trial": {},
   // list of all the trials completed so far
   "trials": []
}

function Trial(number) {
   // trial number, starting at 0
   this.number = number;
   // target option id
   // target option (Object)
   this.targetOption = experiment.optionsSequence[this.number];
   // value that the target opion should be set at (boolean or string)
   this.targetValue = experiment.valuesSequence[this.number];
   // label of the value that the target opion should be set at (string or "")
   this.targetValueLabel = experiment.valuesLabelsSequence[this.number];
   // whether the done button has been pressed, marking the end of the trial
   this.done = false;
   // id of the last selected option
   this.selectedOptionID = false;
   // last selected value of the last selected option
   this.selectedValue = false;

   this.success = function() {
      return this.selectedOptionID === this.targetOption.id && this.targetValue === this.selectedValue;
   };
}

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
   for(var i in option.values) {
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


experiment.startExperiment = function() {
   console.log("Starting experiment")
   experiment.initializeTrial(0);
}

experiment.initializeTrial = function(trialNumber) {
   console.log("Initializing trial " + trialNumber)

   experiment.trial = new Trial(trialNumber);
   model.modalMessage = experiment.generateInstructions();
   model.progressBarMessage = experiment.generateInstructions();

   // Since the rendering of the modal is blocking, show it at the end of digest
   angular.element($("#ad-hoc-panel")).scope().$evalAsync(function() {
      $("#instructions-modal").modal('show');
   })
}

// called when the user clicks the "go!" button in the modal
experiment.startTrial = function() {
   console.log("Starting trial " + experiment.trial.number)
}

// called when the user clicks the 
experiment.endTrial = function() {
   experiment.trial.done = true;

   experiment.trials.push(experiment.trial);

   // after a brief pause, initialize next trial (passing it the next trial.number)
   setTimeout(experiment.initializeTrial, 1000, experiment.trial.number + 1);
}


experiment.generateInstructions = function() {
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
