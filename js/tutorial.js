var tutorial = new Sequencer("tutorial", 500, 2000, "try again", true);

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
   model.modal.buttonLabel = "Start";
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
   model.modal.buttonLabel = "Start";
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
   // dev mode: not linked with Wunderlist backbone
   if (typeof sync == "undefined" || typeof sync.collections == "undefined")
      return true;

   if (this.trial.number == 1)
      return sync.collections.tasks.where({
         title: "buy milk"
      }).length > 0;

   if (this.trial.number == 3)
      return sync.collections.tasks.where({
         title: "buy milk"
      })[0].get("hasNote");

   if (this.trial.number == 4)
      return sync.collections.tasks.where({
         title: "call mom"
      }).length > 0;

   if (this.trial.number == 5)
      return sync.collections.tasks.where({
         title: "call mom"
      })[0].get("starred");

   if (this.trial.number == 8)
      return sync.collections.tasks.where({
         title: "watch a good movie"
      }).length > 0;

   if (this.trial.number == 10)
      return sync.collections.tasks.where({
         title: "buy milk"
      })[0].get("completed");

   if (this.trial.number == 12)
      return sync.collections.tasks.where({
         title: "buy milk"
      }).length === 0;

   return true;
}

tutorial.notEndOfSequence = function() {
   return this.trial.number + 1 < this.steps.length;
}
