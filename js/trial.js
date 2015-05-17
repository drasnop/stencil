function Trial(number) {

   // call parent constructor
   Step.call(this, number);

   // target option (Object)
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
      "firstOptionSelected": 0,
      "lastOptionSelected": 0,
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

   // the last selected option
   this.changedOption = function() {
      if (!this.changedOptions.length)
         return;
      return this.changedOptions[this.changedOptions.length - 1];
   }

   // last selected value of the last selected option
   this.changedValue = function() {
      if (!this.changedValues.length)
         return null;
      return this.changedValues[this.changedValues.length - 1];
   }

   this.success = function() {
      if (!this.changedOptions.length)
         return false;
      return this.targetOption.id === this.changedOption().id && this.targetValue === this.changedValue();
   }

   this.correctHookselected = function() {
      if (!this.changedOptions.length)
         return false;
      return this.changedOption().selected;
   }

   this.instructionsDuration = function() {
      return (this.time.start - this.time.instructionsShown) / 1000;
   }

   this.shortDuration = function() {
      if (!this.time.lastOptionSelected)
         return this.longDuration();
      return (this.time.lastOptionSelected - this.time.customizationMode()) / 1000;
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
         "targetOption": logger.compressOption(this.targetOption),
         "targetValue": this.targetValue,

         "clickedOptions": logger.compressOptions(this.clickedOptions),
         "changedOptions": logger.compressOptions(this.changedOptions),
         "changedValues": this.changedValues,
         "changedOption": logger.compressOption(this.changedOption()),
         "changedValue": this.changedValue(),
         "panelExpanded": this.panelExpanded,

         "highlightedHooks": this.highlightedHooks,
         "highlightedOptions": logger.compressArraysOfOptions(this.highlightedOptions),
         "selectedOptions": logger.compressArraysOfOptions(this.selectedOptions),
         "visitedTabs": logger.compressTabs(this.visitedTabs),
         "reverseHighlighted": logger.compressOptions(this.reverseHighlighted),

         "success": this.success(),
         "timeout": this.timeout,
         "correctHookselected": this.correctHookselected(),

         "time": this.time.loggable(),
         "instructionsDuration": this.instructionsDuration(),
         "shortDuration": this.shortDuration(),
         "longDuration": this.longDuration(),
         "totalDuration": this.totalDuration()
      }
   }


   /* helpers */

   this.logValueChange = function(option) {
      this.changedOptions.push(option);
      this.changedValues.push(option.value);
      this.panelExpanded = model.fullPanel();

      if (this.changedOptions.length == 1)
         this.time.firstOptionSelected = performance.now();

      this.time.lastOptionSelected = performance.now();
   }
}

Trial.prototype = Object.create(Step.prototype);
Trial.prototype.constructor = Trial;
