var experiment = {
   // whether the system is currently used to conduct an experiment
   "experiment": true,
   // random sequence of 8 numbers and letters used to identify participants
   "email": "lotaculi",
   // list of options that users will be ask to find during the experiment
   "optionsSequence": [],
   // index of the current trial
   "trial": 0
}

experiment.generateOptionsSequence = function() {
   model.tabs.forEach(function(tab) {
      experiment.optionsSequence.push(randomElementFrom(tab.options));
      experiment.optionsSequence.push(randomElementFrom(tab.options));
   });

   shuffleArray(experiment.optionsSequence);
   console.log("generated a random sequence of " + experiment.optionsSequence.length + " options")
}

// $("#instructionsModal").modal('show')