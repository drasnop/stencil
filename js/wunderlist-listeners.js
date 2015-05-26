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
         experiment.trial.logValueChange(option, false);

         // notify angular of this change, to unlock the "done" button
         // the test for existing $digest cycle is for weird cases with INVALID shortcuts...
         var scope = angular.element($("#ad-hoc-panel")).scope();
         if (!scope.$$phase)
            scope.$apply();

         // must return newval, since this watcher function is called instead of the setter
         return newval;
      })
   });

}
