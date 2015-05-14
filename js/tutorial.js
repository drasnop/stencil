var tutorial = new Sequencer("tutorial", 500, 2000);

tutorial.steps = [
   "After completing each step of this tutorial, click the blue \"Done\" button in the instructions bar (at the top of the screen).",
   "Type \"buy milk\" in the input field, and press Enter to add a new todo item.",
   "Double-click on the todo item you added to show the details panel on the right.",
   "Write a more detailed description in the yellow area on the right: \"for the cake\"",
   "Add another todo item: \"call mom\"",
   "Click on the star icon to mark it as important.",
   "In the left sidebar, there is an item called \"Starred\". This is an intelligent filter, that shows all the todos due in the coming week. Check that \"call mom\" appears there.",
   "To create another todo, you need to go back to the Inbox. Click on \"Inbox\" in the left sidebar.",
   "Add a third todo item: \"watch a good movie\"",
   "Double-click on this todo item, and change its due date to next Saturday.",
   "Let's say you have bought the milk. Tick the checkbox to mark the corresponding todo item as complete.",
   "At the bottom of the list, there is a button \"1 completed item\". Click on it to reveal the todo you've just checked off.",
   "Delete the todo item \"buy milk\": double-click on it to open the details panel, then click the trash icon at the bottom."
]

/* overwritten methods */

tutorial.start = function() {
   model.progressBarMessage = "";
   model.modal.header = "Setup complete";
   model.modal.message = "Great! Everything is in place. Please follow this quick tutorial to see how Wunderlist works.";
   model.modal.green = true;
   model.modal.hideOnClick = false;
   model.modal.action = (function() {
      Sequencer.prototype.start.call(this);
   }).bind(this);

   showModal();
}

tutorial.end = function() {
   Sequencer.prototype.end.call(this);

   model.progressBarMessage = "";
   model.modal.header = "Congratulations!";
   model.modal.message = "You have completed the tutorial. You can now start the experiment.";
   model.modal.green = true;
   model.modal.hideOnClick = false;
   model.modal.action = experiment.start.bind(experiment);

   showModal();
}

/* methods that need to be implemented */

tutorial.getModalHeader = function() {
   return "Wunderlist tutorial - step " + (this.trial.number + 1) + " / " + this.steps.length;
}

tutorial.getInstructions = function() {
   return this.steps[this.trial.number];
}

tutorial.trialNotPerformed = function() {
   return false;
}

tutorial.trialSuccess = function() {
   return true;
}

tutorial.notEndOfSequence = function() {
   return this.trial.number + 1 < this.steps.length;
}
