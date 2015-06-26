/*
 * logging functions that listen to options changes and tab navigation in Wunderlist
 */

function bindWunderlistListeners() {

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
      return processWunderlistTab(newval);
   })
}


function processWunderlistTab(locationHash) {
   // we are only interested in the preferences panel
   if (locationHash.indexOf("preferences") < 0)
      return locationHash;

   var temp = locationHash.split('/');
   var shortHash = temp[temp.length - 1];

   // find which tab is currently active
   var tab;
   for (var i in model.tabs) {
      tab = model.tabs[i];

      if (tab.hash == shortHash) {
         experimentTrials.trial.visitedTabs.pushStamped({
            "tab": logger.flattenTab(tab)
         })
         break;
      }
   }

   // enable logging of showMoreOptions
   if (shortHash == "shortcuts")
      instrumentShowMoreButtonWhenReady();

   // must return locationHash, since this watcher function is called instead of the setter
   return locationHash;
}
