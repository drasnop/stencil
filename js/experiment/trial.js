/*
 * Inherits the default behavior of Step, with additional data and methods
 * to measure duration and log a variety of events during the experiment trials.
 */

function Trial(number) {

   // call parent constructor
   Step.call(this, number);

   // timeout
   this.timeout = false;

   /* target */

   var targetOption = experiment.sequencer.optionsSequence[number];
   this.target = {
      // target option (Object) (compressed to avoid infinite recursion when logging)
      "option": targetOption,
      // value that the target opion should be set at (boolean or string)
      "value": experiment.sequencer.valuesSequence[number],

      // if there is at least one visual element in the interface that 
      "hasHookOrCluster": targetOption.hasHookOrCluster(),
      // whether the target option is hideable, i.e. all its hooks could be hidden
      "hideable": targetOption.hideable,
      // whether the target option is associated only with "hidden" hooks (true if ghost hook expanded)
      "ghost": targetOption.ghost(),
      // whether the option is actually visible (false if ghost hook not expanded)
      // NB: here, if ghost is true, hasVisibleHook will always be false, because we collapse the cluster for each trial
      "hasVisibleHook": targetOption.hasVisibleHook(),
   }

   this.target.loggable = function() {
      var loggable = {};
      for (var key in this) {
         if (key === "option")
            loggable[key] = this[key].id;
         else if (typeof this[key] !== typeof Function)
            loggable[key] = this[key];
      }
      return loggable;
   }

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
         for (var i = 0; i < experiment.sequencer.trial.preferencesPanel.length; i++) {
            if (experiment.sequencer.trial.preferencesPanel[i].action == "open")
               return experiment.sequencer.trial.preferencesPanel[i].timestamp;
         }
      }

      if (experiment.condition > 0) {
         for (var i = 0; i < experiment.sequencer.trial.customizationMode.length; i++) {
            if (experiment.sequencer.trial.customizationMode[i].action == "enter")
               return experiment.sequencer.trial.customizationMode[i].timestamp;
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
      return model.options[this.target.option.id].value === this.target.value;
   }

   this.correctHookHasBeenSelected = function() {
      for (var i in this.selectedHooks) {
         for (var j in this.selectedHooks[i].options_IDs) {
            if (this.selectedHooks[i].options_IDs[j] == this.target.option.id)
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
         else if (prop === "number")
            loggable[prop] = experiment.sequencer.getExternalTrialNumber();
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

   // need to get hadVisibleHook and clusterExpanded BEFORE the dataManager updates the value of the option, obviously
   this.logValueChange = function(option, oldValue, hadVisibleHook, clusterExpanded, ghost) {
      var time = performance.now();

      // if the user has changed the correct option to the correct value
      var correct = (this.target.option.id === option.id && this.target.value === option.value);

      // save multiple interesting information about this change, for future analysis
      var self = this;
      var change = {
         "option_ID": option.id,
         "oldValue": dataManager.formatValueForModel(oldValue),
         "newValue": option.value,
         "correct": correct,
         "firstTime": firstTimeChanged(self, option),
      }

      // in customization mode, log additional information
      if (experiment.condition > 0) {
         change.panelExpanded = model.fullPanel();
         change.hookWasSelected = option.selected;

         change.hadHookOrCluster = option.hasHookOrCluster();
         change.hadVisibleHook = hadVisibleHook;
         change.hideable = option.hideable;
         change.clusterExpanded = clusterExpanded;
         change.ghost = ghost;
         // set ghost = true if associated hook is "hidden" (although it might be revealed)
      }

      /*
      case                  !anchorable   absent      clusterContracted    clusterExpanded   regular

      hadHookOrCluster      n             n           y                    y                 y
      hadVisibleHook        n             n           n                    y                 y
      ghostHook             n             y/n         y                    y                 n

      hadVisibleHook        n             n           n                    y                 y
      hasGhostHook          n             n           y                    y                 n
      > problem: we can't access hasVisibleHook after the change...

      clusterCollapsed      null          null        y                    n                 null
      clusterExpanded       null          null        n                    y                 null   
      hadVisibleHook        n             n           n                    y                 y
      >  hadVisibleHook = hadHookOrCluster && !clusterCollapsed   (but it's not enough info on its own)

      # final scheme

      anchorable            undef         y           y                    y                 y
      hadHookOrCluster      n             n           y                    y                 y
      hadVisibleHook        n             n           n                    y                 y
      hideable              undef         undef       y                    y                 undef
                            n             n           y                    y                 n
      (then clusterExpanded can be recomputed has hideable && hadVisibleHook)
      (because hadVisibleHook = hadHookOrCluster && !clusterCollapsed)

      NB some options are not hideable themselves, yet they will be hidden in a cluster if their corresponding hooks
      are ghostified by another option they're sharing the hook with... 

      When clusterExpanded is present (i.e. ref option old value is hidden), it has the same value than hadVisibleHook
      Otherwise (not associated with hideable option OR ref option old value = visible), so far there is no direct way to tell these two cases apart
      Arguably these two cases have the same visual appearance, or lack thereof.
      */

      if (experiment.condition === 0 || model.fullPanel()) {
         // in a full panel, selection occurs inside a tab
         change.selectionDuration = (time - this.visitedTabs[this.visitedTabs.length - 1].timestamp) / 1000;
         change.selectBetween = numVisibleOptionsInTab(option.tab);
      } else {
         // in a minimal panel, selection occurs after clicking on a hook
         if (this.selectedHooks.length > 0) {
            change.selectionDuration = (time - this.selectedHooks[this.selectedHooks.length - 1].timestamp) / 1000;
            change.selectBetween = model.selectedOptions.length;
         }
      }

      // workaround: replaced undefined by "undefined", to avoid Firebase error
      for (var prop in change) {
         if (typeof change[prop] === "undefined")
            change[prop] = "undefined";
      }

      // store all of these as one event
      this.changedOptions.pushStamped(change);

      // set first and last optionChanged times
      if (this.changedOptions.length == 1)
         this.time.firstOptionChanged = time;

      this.time.lastOptionChanged = time;

      // as long as the correct option hasn't been selected, log selectionDuration and selectBetween
      // this way we'll get data even for wrong selections
      if (!this.time.correctOptionChanged) {
         this.duration.selection = change.selectionDuration;
         this.duration.selectBetween = change.selectBetween;
      }

      // consider only the first time the correct option was changed...
      if (correct && !this.time.correctOptionChanged) {
         this.time.correctOptionChanged = time;
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
