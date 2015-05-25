function bindWunderlistListeners() {

   // dev mode: not linked with Wunderlist backbone
   if (typeof sync == "undefined" || typeof sync.collections == "undefined")
      return;

   console.log("Initializing Wunderlist listeners...")

   var dateFormat = sync.collections.settings.where({
      key: "date_format"
   })[0];
   dateFormat.attributes.watch("value", function(id, oldval, newval) {
      console.log('o.' + id + ' changed from ' + oldval + ' to ' + newval);
      return newval;
   })


   var timeFormat = sync.collections.settings.where({
      key: "time_format"
   })[0];
   timeFormat.attributes.watch("value", function(id, oldval, newval) {
      console.log('o.' + id + ' changed from ' + oldval + ' to ' + newval);
      return newval;
   })

}
