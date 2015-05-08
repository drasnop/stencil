var tutorial = new Sequencer("tutorial", [
   "Add a new todo: \"buy milk\"",
   "Double-click on the todo to show the details panel on the right",
   "Change the todo due date to tomorrow",
   "Notice that, in the left sidebar, there is an item called \"Week\". This is an intelligent filter, that shows all the todos due in the coming week. The todo \"buy milk\" should appear there.",
   "To create another todo, you need to go back to the Inbox. Click on \"Inbox\" in the left sidebar.",
   "Add another todo: \"watch a fun movie\"",
   "Write a more detailed description of the todo in the description area (in yellow)",
   "Add a third todo: \"do stuff\"",
   "Click on the star icon to mark it as important.",
   "Return to the Inbox, if you weren't already there.",
   "Delete todo \"buy milk\": double-click on it to open the right panel, then click the trash icon at the bottom",
   "Congratulation! You have completed the tutorial. You can now start the experiment."
], 500, Step);


tutorial.end = function() {
   Sequencer.prototype.end.call(this)
   experiment.start();
}


tutorial.getModalHeader = function() {
   return "Wunderlist tutorial - step " + (this.trial.number + 1) + " / " + this.trials.length;
}

tutorial.getInstructions = function() {
   return this.trials[this.trial.number];
}

tutorial.trialNotPerformed = function() {
   return false;
}
