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
   this.preferencesPanel = new EventsQueue();
   // when users clicked on showMoreOptions in a tab
   this.showMoreOptions = new EventsQueue();


   /*    time    */

   this.time = {
      "instructionsShown": false,
      "start": false,
      "firstOptionChanged": false,
      "correctOptionChanged": false,
      "lastOptionChanged": false,
      "end": false
   }

   this.time.customizationMechanismOpened = function() {
      // NB: this refers to trial.time here!

      if (experiment.condition === 0) {
         for (var i = 0; i < experiment.trial.preferencesPanel.length; i++) {
            if (experiment.trial.preferencesPanel[i].action == "open")
               return experiment.trial.preferencesPanel[i].timestamp;
         }
      }

      if (experiment.condition > 0) {
         for (var i = 0; i < experiment.trial.customizationMode.length; i++) {
            if (experiment.trial.customizationMode[i].action == "enter")
               return experiment.trial.customizationMode[i].timestamp;
         }
      }

      return false;
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


   /*    duration    */

   this.duration = {};
   this.duration.time = this.time;

   this.duration.instructions = function() {
      // NB: thanks to the remapping, this.time refers to the correct trial.time
      return (this.time.start - this.time.instructionsShown) / 1000;
   }

   this.duration.short = function() {
      var starTime = this.time.customizationMechanismOpened() ? this.time.customizationMechanismOpened() : this.time.start;

      if (this.time.correctOptionChanged)
         return (this.time.correctOptionChanged - starTime) / 1000;

      if (this.time.lastOptionChanged)
         return (this.time.lastOptionChanged - starTime) / 1000;

      return this.long();
   }

   this.duration.long = function() {
      return (this.time.end - this.time.start) / 1000;
   }

   this.duration.total = function() {
      return (this.time.end - this.time.instructionsShown) / 1000;
   }

   this.duration.loggable = function() {
      var loggable = {};
      for (var key in this) {
         if (typeof this[key] == typeof Function && key !== "loggable" && key !== "constructor")
            loggable[key] = this[key]();
         else if (typeof this[key] !== typeof Function && key !== "time")
            loggable[key] = this[key];
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
   this.logValueChange = function(option, oldValue, clusterCollapsed) {
      var time = performance.now();

      // if the user has changed the correct option to the correct value
      var correct = (this.targetOption.id === option.id && this.targetValue === option.value);

      // save multiple interesting information about this change, for future analysis
      var self = this;
      var change = {
         "option_ID": option.id,
         "oldValue": oldValue,
         "newValue": option.value,
         "correct": correct,
         "firstTime": firstTimeChanged(self, option),
      }

      // in customization mode, log additional information
      if (experiment.condition > 0) {
         change.panelExpanded = model.fullPanel();
         change.hookWasSelected = option.selected;
         change.hadHookOrCluster = option.hasHookOrCluster();
         change.clusterCollapsed = clusterCollapsed;
         change.hadVisibleHook = change.hadHookOrCluster && !change.clusterCollapsed;
      }

      /*
      case                    absent      clusterContracted    clusterExpanded   regular

      hadHookOrCluster        n           y                    y                 y
      hadVisibleHook          n           n                    y                 y
      ghostHook               y/n         y                    y                 n

      hadVisibleHook          n           n                    y                 y
      hasGhostHook            n           y                    y                 n
      > problem: we can't access hasVisibleHook after the change...

      hadHookOrCluster        n           y                    y                 y
      clusterCollapsed        null        y                    n                 null
      > hadVisibleHook = hadHookOrCluster && !clusterCollapsed   (but it's not enough info on its own)
                              n           n                    y                 y
      */

      if (experiment.condition === 0 || model.fullPanel()) {
         // in a full panel, selection occurs inside a tab
         change.selectionDuration = (time - this.visitedTabs[this.visitedTabs.length - 1].timestamp) / 1000;
         change.selectBetween = numVisibleOptionsInTab(option.tab);
      } else {
         // in a minimal panel, selection occurs after clicking on a hook
         change.selectionDuration = (time - this.selectedHooks[this.selectedHooks.length - 1].timestamp) / 1000;
         change.selectBetween = model.selectedOptions.length;
      }

      // store all of these as one event
      this.changedOptions.pushStamped(change);

      // set first and last optionChanged times
      if (this.changedOptions.length == 1)
         this.time.firstOptionChanged = time;

      this.time.lastOptionChanged = time;

      // consider only the first time the correct option was changed...
      if (correct && !this.time.correctOptionChanged) {
         this.time.correctOptionChanged = time;
         this.duration.selection = change.selectionDuration;
         this.duration.selectBetween = change.selectBetween;
      }
   }

   // to check whether participants hesitated
   function firstTimeChanged(self, option) {
      for (var i in self.changedOptions) {
         if (self.changedOptions[i].option_ID == option.id)
            return false;
      }
      return true;
   }

   function numVisibleOptionsInTab(tab) {
      // Wunderlist-specific
      if (experiment.condition === 0) {
         if (tab.name == "Shortcuts")
            return model.wunderlistShowMore ? 18 : 8;
         else
            return tab.options.length;
      }

      if (tab.hasMoreOptions && !tab.showMoreOptions) {
         return tab.options.filter(function(option) {
            return !option.more;
         }).length;
      }

      return tab.options.length;
   }
}

Trial.prototype = Object.create(Step.prototype);
Trial.prototype.constructor = Trial;
