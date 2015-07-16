/*
 * Instance of Sequencer that guides people through multi-step tutorial
 */

var tutorial = new Sequencer("tutorial", 500, 2000, "try again", true, Step, function() {});

tutorial.steps = [
   "After completing each step of this tutorial, click the blue \"Next\" button in the instructions bar (at the top of the screen). <b>Try it now!</b>",
   "Type \"buy milk\" in the input field, and press Enter to add a new todo item.",
   "Double-click on the todo item you added to show the details panel on the right.",
   "Write a more detailed description in the <b>yellow area</b> on the right: \"for the cake\"",
   "Add another todo item: \"call mom\"",
   "Click on the star icon to mark it as important.",
   "In the left sidebar, there is an item called \"Starred\". This is an <b>intelligent filter</b>, that shows all the todos due in the coming week. Check that \"call mom\" appears there.",
   "To create another regular todo item, you need to go back to the Inbox. Click on \"Inbox\" in the left sidebar.",
   "Add a third todo item: \"watch a good movie\"",
   "Double-click on this todo item, and change its due date to this Saturday.",
   "Let's say you have bought the milk. Tick the checkbox to mark the corresponding todo item as complete (= check it off)",
   "Below the list of todo items, there is a button \"1 completed item\". Click on it to reveal the todo you've just checked off.",
   "Delete the todo item \"buy milk\": double-click on it to open the details panel, then click the trash icon at the bottom."
]

tutorial.stepsCustomizationMode = [
   "To change the settings, click on \"Ann Onymous ▼\" in the top left corner, and choose <b>Customize</b> in the menu."
]

tutorial.stepspreferences = [
   "To change the settings, click on \"Ann Onymous ▼\" in the top left corner, and choose <b>Settings</b> in the menu. <b>Try it now!</b>"
]

tutorial.time = {
   "stepStart": 0,
   "stepEnd": 0
}


/* overwritten methods */

tutorial.start = function() {

   if (experiment.condition > 0)
      this.steps.push.apply(this.steps, this.stepsCustomizationMode);
   else
      this.steps.push.apply(this.steps, this.stepspreferences);

   Sequencer.prototype.start.call(this);
}

tutorial.startTrial = function() {
   this.time.stepStart = performance.now();
   Sequencer.prototype.startTrial.call(this);
}

tutorial.endTrial = function() {
   this.time.stepEnd = performance.now();
   var loggable = {
      "step": this.trial.number,
      "instructions": this.steps[this.trial.number],
      "duration": (this.time.stepEnd - this.time.stepStart) / 1000
   };
   logger.firebase.child("/tutorial").push(loggable);
   Sequencer.prototype.endTrial.call(this);
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

   switch (this.trial.number) {
      case 1:
         return sync.collections.tasks.where({
            title: "buy milk"
         }).length > 0;

      case 3:
         return sync.collections.tasks.where({
            title: "buy milk"
         })[0].get("hasNote");

      case 4:
         return sync.collections.tasks.where({
            title: "call mom"
         }).length > 0;

      case 5:
         return sync.collections.tasks.where({
            title: "call mom"
         })[0].get("starred");

      case 8:
         return sync.collections.tasks.where({
            title: "watch a good movie"
         }).length > 0;

      case 10:
         return sync.collections.tasks.where({
            title: "buy milk"
         })[0].get("completed");

      case 12:
         return sync.collections.tasks.where({
            title: "buy milk"
         }).length === 0;
   }

   return true;
}

tutorial.getCurrentReward = function() {
   return -1;
}

tutorial.notEndOfSequence = function() {
   return this.trial.number + 1 < this.steps.length;
}

// explain how CM works with a few popups, triggered by various timers and listeners
tutorial.addExplanatoryPopups = function() {

   correctHookNotSelectedTimer = setTimeout(function() {
      alert("Hint: Left-click on the \"Assigned to me\" smart filter, in the left sidebar, to bring up the settings associated with it.")
   }, 30 * 1000)

   // watcher for correct hook selected
   model.watch("selectedOptions", function(prop, oldval, newval) {

      // if model.selectedOptions is empty, do nothing
      if (newval.length === 0)
         return newval;

      // small timeout to ensure the options panel will appear before the alert popup
      setTimeout(function() {

         // check if this is the correct hook
         if (newval.indexOf(experiment.sequencer.trial.targetOption) < 0) {
            alert("The setting you are looking for is not associated with this item. Try to click on another one!")
         } else {

            // since the correct hook has been selected, clean up explanatory popups
            clearTimeout(correctHookNotSelectedTimer);
            model.unwatch("selectedOptions");

            alert("Good job! You have found an item related to the setting you have to change!")

            setTimeout(function() {
               if (experiment.condition == 3)
                  alert("In this panel, the settings highlighted in *orange* are related to the item you clicked on.\nNow hide the \"Starred\" smart filter.")
               else
                  alert("The settings in this orange popup are related to the item you clicked on.\nNow hide the \"Starred\" smart filter.")
            }, 1000)
         }

      }, 50)

      /*         //  watcher for changed option
               experiment.sequencer.trial.changedOptions.watch("length", function(prop, oldval, newval) {

                  setTimeout(function() {
                     var trial = experiment.sequencer.trial;
                     console.log(trial.changedOptions.length)

                     // check if this is the correct option
                     if (trial.changedOptions[trial.changedOptions.length - 1].option_ID != trial.targetOption.id) {
                        alert("Sorry, this isn't the correct setting. Try another one!")
                     } else {
                        // check if this is the correct value
                        if (trial.changedOptions[trial.changedOptions.length - 1].newValue != trial.targetValue) {
                           alert("This is the setting you're looking for, but you haven't given it the correct value. Try again!")
                        } else {

                           // since the option has been sucessfully changed, clean up explanatory popups
                           trial.unwatch("changedOptions");

                           alert("Well done! Click the \"Next\" button to finish the trial.")
                        }
                     }

                  }, 100)
               })*/

      return newval;
   })
}
