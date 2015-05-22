function Trial(number) {

   // call parent constructor
   Step.call(this, number);

   this.timeout = false;
   this.correctOptionWasHighlightedWhenChanged = false;

   // this boolean will be set by this.successful() at the end of the trial
   this.success = false;

   // target option (Object) (compressed to avoid infinite recursion when logging)
   this.targetOption = experiment.optionsSequence[this.number];
   // value that the target opion should be set at (boolean or string)
   this.targetValue = experiment.valuesSequence[this.number];

   // list of all the options that were clicked during this trial (to detect when a user has expanded an option)
   this.clickedOptions = [];
   // list of all the options that were changed during this trial
   this.changedOptions = [];
   // list of all the values that were changed during this trial
   this.changedValues = [];
   // whether the panel was expanded when the last option was changed
   this.panelExpanded = null;

   // list of the CSS selectors of all the hooks highlighted during this trial
   this.highlightedHooks = [];
   // list of arrays of highlighted options (from hover on hooks)
   this.highlightedOptions = [];
   // list of arrays of selected options (from clicks on hooks)
   this.selectedOptions = [];
   // list of all the tabs visited (including the one shown when opening the panel)
   this.visitedTabs = [];
   // list of all the options that were reverse highlighted (because of hover on control/icon)
   this.reverseHighlighted = [];

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

   this.correctOptionHasBeenHighlighted = function() {
      for (var i in this.selectedOptions) {
         for (var j in this.selectedOptions[i]) {
            if (this.selectedOptions[i][j].id == this.targetOption.id)
               return true;
         }
      }
      return false;
   }

   this.instructionsDuration = function() {
      return (this.time.start - this.time.instructionsShown) / 1000;
   }

   this.shortDuration = function() {
      if (!this.time.correctOptionChanged)
         return this.longDuration();
      return (this.time.correctOptionChanged - this.time.customizationMode()) / 1000;
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
         if (this[prop] === null)
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

   this.logValueChange = function(option) {
      var time = performance.now();

      // if this is the correct option
      if (this.targetOption.id === option.id && this.targetValue === option.value) {
         this.time.correctOptionChanged = time;
         this.correctOptionWasHighlightedWhenChanged = option.selected;
         this.panelExpanded = model.fullPanel();
      }

      // prepare logging (using a .correct flag for later processing)
      this.changedOptions.push(option.id);
      this.changedValues.push(option.value);

      if (this.changedOptions.length == 1)
         this.time.firstOptionChanged = time;

      this.time.lastOptionChanged = time;
   }
}

Trial.prototype = Object.create(Step.prototype);
Trial.prototype.constructor = Trial;
