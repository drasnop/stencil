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

   // hooks

   // list of the hooks hovered = highlighted during this trial, with their array of associated options
   this.highlightedHooks = new EventsQueue();
   // list of the CSS selectors of all the hooks clicked = selected during this trial, with their array of associated options
   this.selectedHooks = new EventsQueue();

   // panel

   // list of all the tabs visited (including the one shown when opening the panel)
   this.visitedTabs = new EventsQueue();
   // list of all the options that were clicked during this trial (to detect when a user has expanded an option)
   this.clickedOptions = new EventsQueue();
   // list of all the options that were changed during this trial, with the corresponding value and other useful info
   this.changedOptions = new EventsQueue();
   // list of all the options that were reverse highlighted (because of hover on control/icon)
   this.reverseHighlighted = new EventsQueue();

   // nav events

   // when the panel was expanded or contracted
   this.panel = new EventsQueue();
   // when the cluster marker was expanded or contracted
   this.cluster = new EventsQueue();
   // when users entered or existed customization mode
   this.customizationMode = new EventsQueue();
   // when users opened or closed the preferences panel
   this.preferences = new EventsQueue();

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
      for (var i in this.selectedHooks) {
         for (var j in this.selectedHooks[i].options_IDs) {
            if (this.selectedHooks[i].options_IDs[j] == this.targetOption.id)
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
         return (this.time.lastOptionChanged - this.time.customizationMode()) / 1000;

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
         else if (typeof this[prop] === typeof Function && prop !== "successful" && prop !== "loggable" && prop !== "logValueChange" && prop !== "firstTimeSelected" && prop !== "constructor")
            loggable[prop] = this[prop]();
      }
      return loggable;
   }


   /* helpers */

   // need to get hadVisibleHighlightableHook BEFORE the dataManager updates the value of the option, obviously
   this.logValueChange = function(option, hadVisibleHook) {
      var time = performance.now();

      // if the user has changed the correct option to the correct value
      var correct = (this.targetOption.id === option.id && this.targetValue === option.value);

      // save multiple interesting information about this change, for future analysis
      var self = this;
      var change = {
         "option_ID": option.id,
         "value": option.value,
         "correct": correct,
         "firstTime": firstTimeChanged(self, option),
         "panelExpanded": model.fullPanel(),
         "hookWasSelected": option.selected,
         "hadVisibleHook": hadVisibleHook,
         "hadHook": option.hasHighlightableHookOrCluster()
      }

      // store all of these as one event
      this.changedOptions.pushStamped(change);

      // set first and last optionChanged times
      if (this.changedOptions.length == 1)
         this.time.firstOptionChanged = time;

      this.time.lastOptionChanged = time;

      // consider only the first time the correct option was changed...
      if (correct && !this.time.correctOptionChanged)
         this.time.correctOptionChanged = time;
   }

   // to check whether participants hesitated
   function firstTimeChanged(self, option) {
      for (var i in self.changedOptions) {
         if (self.changedOptions[i].option_ID == option.id)
            return false;
      }
      return true;
   }
}

Trial.prototype = Object.create(Step.prototype);
Trial.prototype.constructor = Trial;
