var tutorial = {

   "steps": ["Add a new todo: \"buy milk\"",
      "Double-click on the todo to show the details panel on the right",
      "Change the todo due date to tomorrow",
      "To create another todo, you need to go back to the Inbox, by clicking on \"Inbox\" in the left sidebar.",
      "Add another todo: \"watch a fun movie\"",
      "Write a more detailed description of the todo in the description area (in yellow)",
      "Add a third todo: \"do stuff\"",
      "Click on the star icon to mark it as important.",
      "Return to the Inbox, if you weren't already there.",
      "Delete todo \"buy milk\"",
      "double-click on it to open the right panel",
      "click the trash icon at the bottom",
      "Congratulation! You have completed the tutorial. You can now start the experiment."
   ],

   "step": {}
}

function Step(number) {
   this.number = number;
   this.done = false;
}

tutorial.start = function() {
   console.log("Starting tutorial")
   model.modalHeader="Wunderlist tutorial";
   tutorial.initializeTrial(0)
}

tutorial.initializeTrial = function(trialNumber) {
   tutorial.step = new Step(trialNumber);
   model.modalMessage = tutorial.steps[trialNumber];
   model.progressBarMessage = tutorial.steps[trialNumber];

   // Since the rendering of the modal is blocking, show it at the end of digest
   angular.element($("#ad-hoc-panel")).scope().$evalAsync(function() {
      $("#instructions-modal").modal('show');
   })
}

tutorial.startTrial = function() {
   console.log("Tutorial step " + tutorial.step.number)
}

tutorial.endTrial = function() {
   tutorial.step.done=true;

   if(tutorial.step.number < tutorial.steps.length) {
      // after a brief pause, initialize next trial (passing it the next trial.number)
      setTimeout(tutorial.initializeTrial, 1000, tutorial.step.number + 1);
   }
   else
      tutorial.end();
}

tutorial.end=function(){
   console.log("Tutorial ended");
   experiment.start();
}


tutorial.trialNotPerformed = function() {
   return false;
}

tutorial.trialDone = function() {
   return tutorial.step.done;
}

tutorial.trialSuccess = function() {
   return true;
}
