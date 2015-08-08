/*
 * Instance of Sequencer that guides people through multi-step tutorial
 */

var tutorial = new Sequencer("tutorial", 500, 2000, "try again", true, Step, function() {});

tutorial.steps = [
   "After completing each step of this tutorial, click the blue \"Next\" button in the instructions bar (at the top of the screen). <b>Try it now!</b>",
   "Type \"buy milk\" in the input field, and press Enter to add a new to-do.",
   "Double-click on the to-do you added to show the details panel on the right.",
   "Write a more detailed description in the <b>yellow area</b> on the right: \"for the cake\"",
   "Add another to-do: \"call mom\"",
   "Click on the star icon to mark it as important.",
   "In the left sidebar, there is a to-do called \"Starred\". This is an <b>intelligent filter</b>, that shows all the to-dos due in the coming week. Check that \"call mom\" appears there.",
   "You can also create your own lists. Click on the the \"+\" button at the bottom left of the screen, and create a list called \"TV shows\"",
   "Go back to the Inbox, by clicking on \"Inbox\" in the left sidebar.",
   "Add a third to-do: \"watch a good movie\"",
   "Double-click on this to-do, and change its due date to this Sunday.",
   "Click on the bell-shaped icon at the top left of the screen. This is were notifications (or \"Activities\") will be shown.",
   "Click on the magnifier icon next to it, and search for \"movie\". Your to-do \"watch a good movie\" should appear.",
   "Now let's say you have bought the milk. Go back to the Inbox, and tick the appropriate checkbox to mark this to-do as complete (= check it off)",
   "Below the list of to-dos, there is a button \"Show completed to-dos\". Click on it to reveal the to-do you've just checked off.",
   "Delete the to-do \"buy milk\": double-click on it to open the details panel, then click the trash icon at the bottom."
]

tutorial.stepsCustomizationMode = [
   "To change the settings, click on \"Ann Onymous ▼\" in the top left corner, and choose <b>Customize</b> in the menu. <b>Try it now!</b>"
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

      case 9:
         return sync.collections.tasks.where({
            title: "watch a good movie"
         }).length > 0;

      case 13:
         return sync.collections.tasks.where({
            title: "buy milk"
         })[0].get("completed");

      case 15:
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
      alert("Hint: Left-click on the \"Starred\" smart filter, in the left sidebar, to bring up the settings associated with it.")
   }, 30 * 1000)

   // watcher for correct hook selected
   model.watch("selectedOptions", function(prop, oldval, newval) {

      // if model.selectedOptions is empty, do nothing
      if (newval.length === 0)
         return newval;

      // small timeout to ensure the options panel will appear before the alert popup
      setTimeout(function() {

         // check if this is the correct hook
         if (newval.indexOf(experiment.sequencer.trial.target.option) < 0) {
            alert("The setting you are looking for is not associated with this item. Try to click on another one!")
         } else {

            // since the correct hook has been selected, clean up explanatory popups
            clearTimeout(correctHookNotSelectedTimer);
            model.unwatch("selectedOptions");

            alert("Good job! You have found an appropriate item to click on!\n\n" +
               (experiment.condition == 3 ? "In this panel, the settings highlighted in *orange* are related to the item you clicked on.\nYou can now hide the \"Starred\" smart filter easily." :
                  "The settings in this orange popup are related to the item you clicked on.\nYou can now hide the \"Starred\" smart filter easily."
               ))
         }

      }, 100)

      return newval;
   });

   //  watcher for changed option
   model.options["smartlist_visibility_starred"].watch("value", function(prop, oldval, newval) {
      // small timeout to wait for the hiding animation to complete
      setTimeout(function() {
         if (newval == "hidden") {
            var scope = angular.element($("#ad-hoc-panel")).scope();
            scope.$apply(scope.closePanel);
            alert("Well done! The \"Starred\" smart filter is now hidden.\nBut it is still accessible! Reveal it by clicking on the blue chevron icon (\"❯\" downwards) at the bottom of the list of filters.")

            clusterExpandedTimer = setTimeout(function() {
               alert("Hint: Click on the blue chevron icon (\"❯\" downwards) at the bottom of the list of filters, to reveal the hidden \"Starred\" smart filter.")
            }, 20 * 1000)
         } else {
            alert("Sorry, this isn't the correct value. You have to set it to \"hidden\".")
         }
      }, 600)
      return newval;
   });

   // watcher for cluster expanded
   experiment.sequencer.trial.cluster.watch("length", function(prop, oldval, newval) {
      // small timeout to wait for the hiding animation to complete
      setTimeout(function() {
         if (model.options["smartlist_visibility_starred"].value == "hidden") {

            // since the cluster has been appropriately expanded, clear the timeout
            clearTimeout(clusterExpandedTimer);

            alert("Good job! That's how you can change a setting even if its corresponding item is hidden.\nOk, click on the \"Next\" button to move on.")

            experiment.sequencer.miniTutorialCompleted = true;
            angular.element($("#ad-hoc-panel")).scope().$apply();
         }
      }, 600)
      return newval;
   });
}
