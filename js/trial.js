function Trial(number) {
   // trial number, starting at 0
   this.number = number;
   // whether the done button has been pressed, marking the end of the trial
   this.done = false;
   // target option id
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
   this.panelExpanded = "";

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

   this.startTime = 0;
   this.customizationModeTime = 0;
   this.firstOptionSelectedTime = 0;
   this.lastOptionSelectedTime = 0;
   this.endTime = 0;


   /* smart accessors */

   // the last selected option
   this.changedOption = function() {
      return this.changedOptions[this.changedOptions.length - 1];
   }

   // last selected value of the last selected option
   this.changedValue = function() {
      return this.changedValues[this.changedValues.length - 1];
   }

   this.success = function() {
      return this.targetOption.id === this.changedOption().id && this.targetValue === this.changedValue();
   }

   this.duration = function() {
      return (this.lastOptionSelectedTime - this.customizationModeTime) / 1000;
   }

   this.totalDuration = function() {
      return (this.endTime - this.startTime) / 1000;
   }


   /* logging method */

   this.loggable = function() {
      return {
         "number": this.number,
         "targetOption": flattenOption(this.targetOption),
         "targetValue": this.targetValue,

         "clickedOptions": flattenOptions(this.clickedOptions),
         "changedOptions": flattenOptions(this.changedOptions),
         "changedValues": this.changedValues,
         "changedOption": flattenOption(this.changedOption()),
         "changedValue": this.changedValue(),
         "panelExpanded": this.panelExpanded,

         "highlightedHooks": this.highlightedHooks,
         "highlightedOptions": flattenArraysOfOptions(this.highlightedOptions),
         "selectedOptions": flattenArraysOfOptions(this.selectedOptions),
         "visitedTabs": flattenTabs(this.visitedTabs),
         "reverseHighlighted": flattenOptions(this.reverseHighlighted),

         "success": this.success(),
         "correctHookselected": this.changedOption().selected,

         "startTime": this.startTime,
         "customizationModeTime": this.customizationModeTime,
         "firstOptionSelectedTime": this.firstOptionSelectedTime,
         "lastOptionSelectedTime": this.lastOptionSelectedTime,
         "endTime": this.endTime,

         "duration": this.duration(),
         "totalDuration": this.totalDuration()
      }
   }


   /* helpers */

   this.logValueChange = function(option) {
      this.changedOptions.push(option);
      this.changedValues.push(option.value);
      this.panelExpanded = model.fullPanel();
   }

   function flattenArraysOfOptions(arr) {
      return arr.map(function(options) {
         return flattenOptions(options);
      })
   }

   function flattenOptions(options) {
      return options.map(function(option) {
         return flattenOption(option);
      })
   }

   function flattenTabs(tabs) {
      return tabs.map(function(tab) {
         return flattenTab(tab);
      })
   }

   function flattenOption(option) {
      // shallow copy
      var flattened = $.extend({}, option);

      // prevent infinite recursion by storing only option.id in that tab
      flattened["tab"] = flattenTab(option["tab"]);

      // remove non-interesting data
      delete flattened["$$hashKey"];
      delete flattened["__proto__"];

      return flattened;
   }

   function flattenTab(tab) {
      // shallow copy
      var flattened = $.extend({}, tab);

      // prevent infinite recursion by storing only option.id in that tab
      flattened["options"] = tab["options"].map(function(option) {
         return option.id;
      });
      // remove non-interesting data
      delete flattened["$$hashKey"];
      delete flattened["__proto__"];

      return flattened;
   }
}
