/*  
 *  API to access and change Wunderlist settings
 */

var wunderlist = (function() {
   var wunderlist = {};

   wunderlist.getAppValue = function(id) {
      return wunderlist.formatValueForModel(wunderlist.getRawAppValue(id));
   }

   wunderlist.getRawAppValue = function(id) {
      if (wunderlist.getAppSetting(id))
         return wunderlist.getAppSetting(id).get("value");
      else
         return "UNDEFINED";
   }

   wunderlist.getAppSetting = function(id) {
      return sync.collections.settings.where({
         key: id
      })[0];
   }

   wunderlist.setAppValue = function(id, value) {
      if (wunderlist.getAppSetting(id))
         wunderlist.getAppSetting(id).set({
            value: wunderlist.formatValueForWunderlist(value)
         })
      else
         console.log("no underlying Wunderlist settings to update for:", id)
   }

   // Must convert boolean into strings for Wunderlist...
   wunderlist.formatValueForWunderlist = function(value) {
      if (typeof value === "boolean")
         return value ? "true" : "false";
      else
         return value;
   }

   // Convert back strings to booleans
   wunderlist.formatValueForModel = function(value) {
      switch (value) {
         case "true":
            return true;
         case "false":
            return false;
         default:
            return value;
      }
   }

   wunderlist.forceVisibilityOfSmartlists = function() {
      model.options.forEachUserAccessible(function(option) {
         if (option.showHide) {
            $("ul.filters-collection .sidebarItem:eq(" + (option.index + 1) + ")").toggleClass("force-animate-up", option.value == "hidden");
            $("ul.filters-collection .sidebarItem:eq(" + (option.index + 1) + ")").toggleClass("force-animate-down", option.value != "hidden");
         }
      })
   }

   wunderlist.restoreVisibilityOfSmartlists = function() {
      $("ul.filters-collection .sidebarItem").each(function() {
         $(this).removeClass("force-animate-up");
         $(this).removeClass("force-animate-down");
      });
   }


   return wunderlist;
})();
