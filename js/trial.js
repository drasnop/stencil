function Trial(number) {

   // call parent constructor
   Step.call(this, number);

   this.timeout = false;
   this.optionWasHighlighted = null;

   // target option (Object) (compressed to avoid infinite recursion when logging)
   this.targetOption = logger.compressOption(experiment.optionsSequence[this.number]);
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
   // list of all highlighted options (from hover on hooks)
   this.highlightedOptions = [];
   // list of all selected options (from clicks on hooks)
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
         if (typeof this[key] != typeof Function)
            loggable[key] = this[key];
      }
      return loggable;
   }

   /* smart accessors */

   this.success = function() {
      return model.options[this.targetOption.id].value === this.targetValue;
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

   this.loggable = function() {
      return {
         "number": this.number,
         "targetOption": this.targetOption,
         "targetValue": this.targetValue,

         "clickedOptions": this.clickedOptions,
         "changedOptions": this.changedOptions,
         "changedValues": this.changedValues,
         "panelExpanded": this.panelExpanded,

         "highlightedHooks": this.highlightedHooks,
         "highlightedOptions": this.highlightedOptions,
         "selectedOptions": this.selectedOptions,
         "visitedTabs": this.visitedTabs,
         "reverseHighlighted": this.reverseHighlighted,

         "success": this.success(),
         "timeout": this.timeout,
         "optionWasHighlighted": this.optionWasHighlighted,

         "time": this.time.loggable(),
         "instructionsDuration": this.instructionsDuration(),
         "shortDuration": this.shortDuration(),
         "longDuration": this.longDuration(),
         "totalDuration": this.totalDuration()
      }
   }


   /* helpers */

   this.logValueChange = function(option) {
      var time = performance.now();

      this.changedOptions.push(logger.compressOption(option));
      this.changedValues.push(option.value);

      // if this is the correct option
      if (this.targetOption.id === option.id && this.targetValue === option.value) {
         this.time.correctOptionChanged = time;
         this.optionWasHighlighted = option.selected;
         this.panelExpanded = model.fullPanel();
      }

      if (this.changedOptions.length == 1)
         this.time.firstOptionChanged = time;

      this.time.lastOptionChanged = time;
   }
}

Trial.prototype = Object.create(Step.prototype);
Trial.prototype.constructor = Trial;
