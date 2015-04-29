var experiment = {
   // whether the system is currently used to conduct an experiment
   "experiment": true,
   // random sequence of 8 numbers and letters used to identify participants
   "email": "lotaculi",
   // list of options that users will be ask to find during the experiment
   "optionsSequence": [],
   // index of the current trial
   "trial": 0,
   //
   "complete": false,
   "success": false,
   // last selected option
   "selected": ""
}

experiment.generateOptionsSequence = function() {
   model.tabs.forEach(function(tab) {
      experiment.optionsSequence.push(randomElementFrom(tab.options));
      experiment.optionsSequence.push(randomElementFrom(tab.options));
   });

   shuffleArray(experiment.optionsSequence);
   console.log("generated a random sequence of " + experiment.optionsSequence.length + " options")
}

experiment.startExperiment = function() {
   console.log("Starting experiment")
   experiment.initializeTrial();
}

experiment.initializeTrial = function() {
   console.log("Initializing trial " + experiment.trial + $("#instructions-modal").length)
   $("#instructions-modal").modal('show')
}

experiment.startTrial = function() {
   experiment.complete = false;
   console.log("Starting trial " + experiment.trial)
}

experiment.endTrial = function() {
   experiment.complete = true;

   // check result
   experiment.success = (experiment.selected === experiment.optionsSequence[experiment.trial].id);

   experiment.trial++;
   setTimeout(experiment.initializeTrial, 1000);
}
