/*
 * Initialize model.options, tabs and mappings by linking them together and adding helpers.
 * Then handle the symchronisation between the underlying Wunderlist options and model.options
 */

var dataManager = (function() {
   var dataManager = {};


   dataManager.initializeDataStructuresIfAllLoaded = function() {
      if (Object.keys(model.options).length > 0 && model.mappings.length > 0 && model.tabs.length > 0) {


         /* accessor and iterators on model.options, mappings and tabs */

         // creates a convenient enumerating (but non-enumerable!) function
         Object.defineProperty(model.options, "forEach", {
            value: function(callback) {
               Object.keys(this).forEach(function(key) {
                  callback(this[key]);
               }, this)
            }
         })

         // creates a convenient enumerating (but non-enumerable!) function
         Object.defineProperty(model.options, "forEachUserAccessible", {
            value: function(callback) {
               this.forEach(function(option) {
                  if (!option.notUserAccessible)
                     callback(option);
               })
            }
         })

         // convenient accessor for retrieving all the mappings for a particular option
         Object.defineProperty(model.mappings, "getMappingsOf", {
            value: function(option) {
               return this.filter(function(mapping) {
                  return mapping.options.indexOf(option) >= 0;
               });
            }
         })

         // creates a convenient enumerating (but non-enumerable!) function
         Object.defineProperty(model.tabs, "forEachNonBloat", {
            value: function(callback) {
               this.forEach(function(tab) {
                  if (!tab.bloat)
                     callback(tab);
               })
            }
         })


         /* pointers and indexes for options and tabs */

         // replace mapping.option_ids by pointers to actual options
         model.mappings.forEach(function(mapping) {
            var mappingOptions = mapping.options.map(function(option_id) {
               return model.options[option_id];
            })
            mapping.options = mappingOptions;
         })

         // replace tab.option_ids by pointers to actual options
         model.tabs.forEachNonBloat(function(tab) {
            var tabOptions = tab.options.map(function(option_id) {
               return model.options[option_id];
            })
            tab.options = tabOptions;
         })

         // add pointer to tab (and index in that tab) to options
         model.tabs.forEachNonBloat(function(tab) {
            for (var i = 0; i < tab.options.length; i++) {
               tab.options[i].tab = tab;
               // the display code only uses filteredIndex (not the real .index), but this could be useful in the analysis
               tab.options[i].index = i;
            }
         })

         // add tab index information for future sorting
         for (var i = 0, len = model.tabs.length; i < len; i++) {
            model.tabs[i].index = i;
         }



         /* options methods */

         // add a helpers function to each option, used for reverse highlighting and logging
         model.options.forEach(function(option) {

            // use defineProperty syntax to avoid it being logged later on
            Object.defineProperty(option, "hasHookOrCluster", {
               value: function() {
                  // check if there is at least one hook or one cluster-marker visible
                  // the hook can be a hidden ghost, though
                  return !!option.anchorable && $(".highlightable").filter(function() {
                     return $(this).data("options").indexOf(option) >= 0;
                  }).filter(":visible").length > 0;
               }
            });

            // use defineProperty syntax to avoid it being logged later on
            Object.defineProperty(option, "hasVisibleHook", {
               value: function() {
                  // 1. Find which mappings this option appears in, add the corresponding selectors to a list
                  var selectors = model.mappings.getMappingsOf(option).map(function(mapping) {
                     return mapping.selector;
                  })

                  // 2. For each selector, test if at least one hook is present and visible
                  for (var i in selectors) {
                     if ($(selectors[i]).filter(":visible").length > 0)
                        return true;
                  }
                  return false;
               }
            });

            // use defineProperty syntax to avoid it being logged later on
            Object.defineProperty(option, "ghost", {
               value: function() {
                  var option = this;

                  // 1. find all the hooks mapped to this option
                  var hooks = $(".hook").filter(function() {
                     return $(this).data("options").indexOf(option) >= 0;
                  })

                  // 2. test if at least one is not a ghost
                  var allGhosts = true;
                  hooks.each(function() {
                     if (!$(this).hasClass("ghost"))
                        allGhosts = false;
                  })
                  return allGhosts;
               }
            });
         });



         /* options flags */

         // set option.anchorable to true if this option is part of mapping
         // (although there is no guarantee that this option will actually be anchored,
         // which depends on the availability of an anchor of the correct type in the DOM)
         model.mappings.forEach(function(mapping) {
            mapping.options.forEach(function(option) {
               option.anchorable = true;
            });
         })

         // set option.hideable to true if this option is mapped to a hook that can be hidden
         // (=turned into a ghost) by an option of type show/hide
         model.options.forEach(function(option) {
            // 0. consider only the options part of a mapping
            if (!option.anchorable) {
               option.hideable = false;
               return;
            }

            // 1. find in which mappings this option appears in, if any
            var mappings = model.mappings.getMappingsOf(option);

            // 2. test if all of these mappings contain a show/hide option
            option.hideable = allHooksCouldBeHidden(mappings);
         });


         // sets the active tab to a default, to avoid undefined errors before the first call to showPanel()
         model.activeTab = model.tabs[0];

         console.log("All data pre-processed")

         // For debug purposes
         //enterCustomizationMode();

         // initialize experiment
         if (parameters.experiment)
            experiment.initialize();
      }
   }

   function allHooksCouldBeHidden(mappings) {
      for (var m in mappings) {
         if (!mappingContainsShowHide(mappings[m]))
            return false;
      }
      return true;
   }

   function mappingContainsShowHide(mapping) {
      return mapping.options.filter(function(option) {
         return option.showHide;
      }).length > 0;
   }

   /*
      initializeOptionsFromApp
         updateOption(option, value)

      initializeAppOptionsFromFile
         updateAppOption(id, value)
            formatValueForWunderlist
   */


   // UNUSED in the experiment software (instead, load the default options)
   dataManager.initializeOptionsFromApp = function() {

      // dev mode: not linked with Wunderlist backbone
      if (typeof sync == "undefined" || typeof sync.collections == "undefined") {
         console.log("No underlying app to initialize options from")
         return;
      }

      console.log("Syncing options with underlying app...")

      var value;
      model.options.forEach(function(option) {
         value = dataManager.getRawAppValue(option.id);
         dataManager.updateOption(option, value);
      })
   }

   // FOR THE EXPERIMENT: modify Wunderlist options to match the default ones defined in the file
   dataManager.initializeAppOptionsFromFile = function() {

      // dev mode: not linked with Wunderlist backbone
      if (typeof sync == "undefined" || typeof sync.collections == "undefined") {
         console.log("No underlying app options to be initialized from default options")
         return;
      }

      console.log("Syncing options of underlying app...")

      // don't force sync the "deep" parameters that the app uses internally
      model.options.forEachUserAccessible(function(option) {

         // the value will be formatted if needed by this method
         dataManager.updateAppOption(option.id, option.value);
      })
   }

   // I am using booleans, but Wunderlist stores these options as strings!
   dataManager.updateOption = function(option, value) {
      option.value = dataManager.formatValueForModel(value);
      console.log("- updating:", option.id, option.value)
   }

   // update a Wunderlist option to match its correct value, calling an update of hooks and clusters if needed
   dataManager.updateAppOption = function(id, value, updateHooksAndClusters) {

      if (typeof sync != "undefined" && typeof sync.collections != "undefined") {
         dataManager.setAppValue(id, value)
      } else {
         // dev mode: not linked with Wunderlist backbone
         console.log("no underlying application settings to update for: ", id)
      }

      // if the visibility of the corresponding hook has changed, update hooks and clusters, with animation
      if (model.options[id].showHide && updateHooksAndClusters)
         hooksManager.updateHooksAndClusters(true);
   }

   /* API to access and change Wunderlist settings */

   dataManager.getAppValue = function(id) {
      return dataManager.formatValueForModel(dataManager.getRawAppValue(id));
   }

   dataManager.getRawAppValue = function(id) {
      if (dataManager.getAppSetting(id))
         return dataManager.getAppSetting(id).get("value");
      else
         return "UNDEFINED";
   }

   dataManager.getAppSetting = function(id) {
      return sync.collections.settings.where({
         key: id
      })[0];
   }

   dataManager.setAppValue = function(id, value) {
      if (dataManager.getAppSetting(id))
         dataManager.getAppSetting(id).set({
            value: dataManager.formatValueForWunderlist(value)
         })
      else
         console.log("no underlying Wunderlist settings to update for:", id)
   }

   // Must convert boolean into strings for Wunderlist...
   dataManager.formatValueForWunderlist = function(value) {
      if (typeof value === "boolean")
         return value ? "true" : "false";
      else
         return value;
   }

   // Convert back strings to booleans
   dataManager.formatValueForModel = function(value) {
      switch (value) {
         case "true":
            return true;
         case "false":
            return false;
         default:
            return value;
      }
   }

   dataManager.forceVisibilityOfSmartlists = function() {
      model.options.forEachUserAccessible(function(option) {
         if (option.showHide) {
            $("ul.filters-collection .sidebarItem:eq(" + (option.index + 1) + ")").toggleClass("force-animate-up", option.value == "hidden");
            $("ul.filters-collection .sidebarItem:eq(" + (option.index + 1) + ")").toggleClass("force-animate-down", option.value != "hidden");
         }
      })
   }

   dataManager.restoreVisibilityOfSmartlists = function() {
      $("ul.filters-collection .sidebarItem").each(function() {
         $(this).removeClass("force-animate-up");
         $(this).removeClass("force-animate-down");
      });
   }

   return dataManager;
})();
