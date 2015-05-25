function bindWunderlistListeners() {

   // dev mode: not linked with Wunderlist backbone
   if (typeof sync == "undefined" || typeof sync.collections == "undefined")
      return;

   console.log("Initializing Wunderlist listeners...")

   model.options.getUserAccessibleOptions().forEach(function(option) {
      sync.collections.settings.where({
         key: option.id
      })[0].attributes.watch("value", function(prop, oldval, newval) {
         console.log(option.id + '.' + prop + ' changed from ' + oldval + ' to ' + newval);
         return newval;
      })
   });

}
