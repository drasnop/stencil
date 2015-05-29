function Trial(number) {

   // call parent constructor
   Step.call(this, number);

   // timeout
   this.timeout = false;

   // target option (Object) (compressed to avoid infinite recursion when logging)
   this.targetOption = experiment.optionsSequence[this.number];
   // value that the target opion should be set at (boolean or string)
   this.targetValue = experiment.valuesSequence[this.number];


   /*    logging     */

   // this boolean will be set by this.successful() at the end of the trial
   this.success = false;

   // useful information for later analysis
   this.correctOptionWasHighlightedWhenChanged = false;
   this.correctOptionHadVisibleHookWhenChanged = false;
   this.correctOptionHadHighlightableHookOrClusterWhenChanged = false;

   // list of all the options that were clicked during this trial (to detect when a user has expanded an option)
   this.clickedOptions = new EventsQueue();
   // list of all the options that were changed during this trial
   this.changedOptions = new EventsQueue();
   // list of all the values that were changed during this trial
   this.changedValues = new EventsQueue();
   // whether the panel was expanded when the last option was changed
   this.panelExpanded = null;

   // list of the CSS selectors of all the hooks highlighted during this trial
   this.highlightedHooks = new EventsQueue();
   // list of arrays of highlighted options (from hover on hooks)
   this.highlightedOptions = new EventsQueue();
   // list of arrays of selected options (from clicks on hooks)
   this.selectedOptions = new EventsQueue();
   // list of all the tabs visited (including the one shown when opening the panel)
   this.visitedTabs = new EventsQueue();
   // list of all the options that were reverse highlighted (because of hover on control/icon)
   this.reverseHighlighted = new EventsQueue();

   this.time = {
      "instructionsShown": 0,
      "start": 0,
      "enterCustomizationMode": 0,
      "firstOptionChanged": 0,
      "correctOptionChanged": 0,
      "lastOptionChanged": 0,
      "end": 0
   }
   this.time.customizationMode = function() {
      // NB: this refers to trial.time here!
      return this.enterCustomizationMode ? this.enterCustomizationMode : this.start;
   }
   this.time.loggable = function() {
      var loggable = {};
      for (var key in this) {
         if (typeof this[key] !== typeof Function)
            loggable[key] = this[key];
         else if (key !== "loggable" && key !== "constructor")
            loggable[key] = this[key]();
      }
      return loggable;
   }

   /* smart accessors */

   this.successful = function() {
      return model.options[this.targetOption.id].value === this.targetValue;
   }

   this.correctHookHasBeenSelected = function() {
      for (var i in this.selectedOptions) {
         for (var j in this.selectedOptions[i].options_IDs) {
            if (this.selectedOptions[i].options_IDs[j] == this.targetOption.id)
               return true;
         }
      }
      return false;
   }

   this.instructionsDuration = function() {
      return (this.time.start - this.time.instructionsShown) / 1000;
   }

   this.shortDuration = function() {
      if (this.time.correctOptionChanged)
         return (this.time.correctOptionChanged - this.time.customizationMode()) / 1000;

      if (this.time.lastOptionChanged)
         return (this.time.correctOptionChanged - this.time.customizationMode()) / 1000;

      return this.longDuration();
   }

   this.longDuration = function() {
      return (this.time.end - this.time.start) / 1000;
   }

   this.totalDuration = function() {
      return (this.time.end - this.time.instructionsShown) / 1000;
   }


   /* logging method */

   // Creates a new object, with attributes of this and the return values of smart accessors
   this.loggable = function() {
      var loggable = {};
      for (var prop in this) {
         if (typeof this[prop] === "undefined")
            console.log("Logging error: " + prop + " is undefined")
         else if (this[prop] === null)
            loggable[prop] = null;
         else if (prop === "targetOption")
            loggable[prop] = this[prop].id;
         else if (typeof this[prop].loggable === typeof Function)
            loggable[prop] = this[prop].loggable();
         else if (typeof this[prop] !== typeof Function && prop !== "done")
            loggable[prop] = this[prop];
         else if (typeof this[prop] === typeof Function && prop !== "successful" && prop !== "loggable" && prop !== "logValueChange" && prop !== "constructor")
            loggable[prop] = this[prop]();
      }
      return loggable;
   }


   /* helpers */

   // need to get hadVisibleHighlightableHook BEFORE the dataManager updates the value of the option, obviously
   this.logValueChange = function(option, hadVisibleHook) {
      var time = performance.now();

      // if this is the correct option
      if (this.targetOption.id === option.id && this.targetValue === option.value) {

         // log only the first time the correct option was changed...
         if (!this.time.correctOptionChanged)
            this.time.correctOptionChanged = time;

         this.correctOptionWasHighlightedWhenChanged = option.selected;
         this.correctOptionHadVisibleHookWhenChanged = hadVisibleHook;
         this.correctOptionHadHighlightableHookOrClusterWhenChanged = option.hasHighlightableHookOrCluster();
         this.panelExpanded = model.fullPanel();
      }

      // prepare logging (using a .correct flag for later processing)
      this.changedOptions.pushStamped({
         "option_ID": option.id
      });
      this.changedValues.pushStamped({
         "value": option.value
      });

      if (this.changedOptions.length == 1)
         this.time.firstOptionChanged = time;

      this.time.lastOptionChanged = time;
   }
}

Trial.prototype = Object.create(Step.prototype);
Trial.prototype.constructor = Trial;
