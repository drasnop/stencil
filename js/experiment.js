var experiment = {
   // whether the system is currently used to conduct an experiment
   "experiment": true,
   // random sequence of 8 numbers and letters used to identify participants
   "email": "lotaculi",
   // list of options that users will be ask to find during the experiment
   "optionsSequence": [],
   // list of values that the options should be set at during the experiment
   "valuesSequence": [],
   // current trial
   "trial": {},
   // list of all the trials completed so far
   "trials": []
}

function Trial(number, option, value){
   // trial number, starting at 0
   this.number = number;
   // target option id
   // target option (Object)
   this.option = experiment.optionsSequence[this.number];
   // value that the target opion should be set at (boolean or string)
   this.value = experiment.valuesSequence[this.number];
   // whether the done button has been pressed, marking the end of the trial
   this.done = false;
   // id of the last selected option
   this.selectedOptionID = "";
   // last selected value of the last selected option
   this.selectedValue = "";

   this.success = function() {
      return this.selectedOptionID === this.option.id && this.value === this.selectedValue;
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

   experiment.optionsSequence.forEach(function(option){
      experiment.valuesSequence.push(complementValueOf(option));
   })
}

function complementValueOf(option){
   return option.value.name;
}

experiment.startExperiment = function() {
   console.log("Starting experiment")
   experiment.initializeTrial(0);
}

experiment.initializeTrial = function(trialNumber) {
   console.log("Initializing trial " + trialNumber)

   experiment.trial=new Trial(trialNumber);

   $("#instructions-modal").modal('show');
   //angular.element($("#ad-hoc-panel")).scope();
}

experiment.startTrial = function() {
   console.log("Starting trial " + experiment.trial.number)
}

experiment.endTrial = function() {
   experiment.trial.done = true;

   experiment.trials.push(experiment.trial);

   // after a brief pause, initialize next trial
   setTimeout(experiment.initializeTrial, 1000, experiment.trial.number+1);
}
