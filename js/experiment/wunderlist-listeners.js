/*
 * logging functions that listen to options changes and tab navigation in Wunderlist
 */

var wunderlistListeners = (function() {
   var wunderlistListeners = {};

   wunderlistListeners.bindSettingsAndTabsListeners = function() {

      // dev mode: not linked with Wunderlist backbone
      if (typeof sync == "undefined" || typeof sync.collections == "undefined")
         return;

      console.log("Initializing Wunderlist listeners...")

      // listener for each settings change in Wunderlist
      model.options.getUserAccessibleOptions().forEach(function(option) {
         sync.collections.settings.where({
            key: option.id
         })[0].attributes.watch("value", function(prop, oldval, newval) {

            // if this change originated from the model (as a "rectification" at the end of each trial), do nothing
            if (dataManager.formatValueForWunderlist(option.value) === newval)
               return newval;

            console.log('* ' + option.id + '.' + prop + ' changed from', oldval, 'to', newval);

            // update the model accordingly
            dataManager.updateOption(option, newval);

            // log this values change, without caring for visibility of anchors
            experimentTrials.trial.logValueChange(option, oldval);

            // notify angular of this change, to unlock the "done" button
            // the test for existing $digest cycle is for weird cases with INVALID shortcuts...
            var scope = angular.element($("#ad-hoc-panel")).scope();
            if (!scope.$$phase)
               scope.$apply();

            // must return newval, since this watcher function is called instead of the setter
            return newval;
         })
      });

      // listener for tabs in preferences panel
      window.location.watch("hash", function(prop, oldval, newval) {
         return wunderlistListeners.processWunderlistTab(newval);
      })
   }


   // log open/close preferences events, visited tab and instrument showMoreShortcuts button
   wunderlistListeners.processWunderlistTab = function(locationHash) {
      console.log("hash changed to", locationHash)


      /* log preferences open/close events */

      // if this is not the preferences panel
      if (locationHash.indexOf("preferences") < 0) {

         // if preferences panel has just been closed, log it
         if (preferencesOpen) {

            // log this event only if it was caused by a user action
            // (this will not happen when closing/opening panel to refresh it because trial hasn't been initialized yet)
            if (experimentTrials.trial) {
               experimentTrials.trial.preferencesPanel.pushStamped({
                  "action": "close"
               })
            }
         }

         preferencesOpen = false;

         // must return locationHash, since this watcher function is called instead of the setter
         return locationHash;
      }

      // if the preferences panel is shown
      if (locationHash.indexOf("preferences") >= 0) {

         // if preferences panel has just been opened, log it
         if (!preferencesOpen) {

            // log this event only if it was caused by a user action
            // (this will not happen when closing/opening panel to refresh it because trial hasn't been initialized yet)
            if (experimentTrials.trial) {
               experimentTrials.trial.preferencesPanel.pushStamped({
                  "action": "open"
               })
            }
         }

         preferencesOpen = true;
      }


      /* log visited tab */

      // detect which tab is currently active
      var tab = wunderlistListeners.findActiveTab(locationHash);

      // log visited tab
      // (this will not happen when closing/opening panel to refresh it because trial hasn't been initialized yet)
      if (experimentTrials.trial) {
         experimentTrials.trial.visitedTabs.pushStamped({
            "tab": logger.flattenTab(tab)
         })
      }


      /* instrument showMore button */

      // enable logging of showMoreOptions
      if (tab.name == "Shortcuts")
         wunderlistListeners.instrumentShowMoreButtonWhenReady();

      // must return locationHash, since this watcher function is called instead of the setter
      return locationHash;
   }

   // detect which tab is currently active (call with window.location.hash if needed)
   wunderlistListeners.findActiveTab = function(locationHash) {
      var temp = locationHash.split('/');
      var shortHash = temp[temp.length - 1];

      for (var i in model.tabs) {
         if (model.tabs[i].hash == shortHash)
            return model.tabs[i];
      }

      return false;
   }


   wunderlistListeners.instrumentShowMoreButtonWhenReady = function() {
      setTimeout(function() {
         if (!experimentTrials.trial)
            return;

         if ($("#settings button.show-advanced-shortcuts").length < 1)
            wunderlistListeners.instrumentShowMoreButtonWhenReady();
         else {
            console.log("instrumenting Wunderlist's showMore button...")
            model.wunderlistShowMore = false;

            $("#settings button.show-advanced-shortcuts").click(function() {
               model.wunderlistShowMore = !model.wunderlistShowMore;

               experimentTrials.trial.showMoreOptions.pushStamped({
                  "tab": "Shortcuts",
                  "action": model.wunderlistShowMore ? "show" : "hide"
               })
            })
         }
      }, 10)
   }


   return wunderlistListeners;
})();
