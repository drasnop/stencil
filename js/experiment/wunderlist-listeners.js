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

      /* 
        listener for each settings change in Wunderlist
      */

      // new
      bindFormElementsRectifiers();
      bindSettingsListeners();

      // old
      model.options.forEachUserAccessible(function(option) {
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
            if (experiment.sequencer.trial) {
               experiment.sequencer.trial.logValueChange(option, oldval);
            }

            // notify angular of this change, to unlock the "done" button
            // the test for existing $digest cycle is for weird cases with INVALID shortcuts...
            var scope = angular.element($("#ad-hoc-panel")).scope();
            if (!scope.$$phase)
               scope.$apply();

            // must return newval, since this watcher function is called instead of the setter
            return newval;
         })
      });

      /*
        listener for tabs in preferences panel
      */

      // log open/close preferences events, visited tab and instrument showMoreShortcuts button
      window.onhashchange = function() {
         var timestamp = performance.now();


         /* log preferences open/close events */

         // if this is not the preferences panel
         if (location.hash.indexOf("preferences") < 0) {

            // if preferences panel has just been closed, log it
            if (preferencesOpen) {

               // log this event only if it was caused by a user action
               // (this will not happen when closing panel to refresh it because trial has already been saved)
               if (experiment.sequencer.trial) {
                  experiment.sequencer.trial.preferencesPanel.pushStamped({
                     "action": "close"
                  }, timestamp)
               }
            }

            preferencesOpen = false;
            return;
         }

         // if the preferences panel is shown
         if (location.hash.indexOf("preferences") >= 0) {

            // if preferences panel has just been opened, log it
            if (!preferencesOpen) {

               // log this event only if it was caused by a user action
               // (this should not happen when closing/opening panel to refresh it)
               if (experiment.sequencer.trial && experiment.sequencer.trial.time.start) {
                  experiment.sequencer.trial.preferencesPanel.pushStamped({
                     "action": "open"
                  }, timestamp)
               }
            }

            preferencesOpen = true;


            /* log visited tab */

            // detect which tab is currently active
            var tab = wunderlistListeners.findActiveTab();

            // log visited tab
            // (this will not happen when closing/opening panel to refresh it because trial hasn't been initialized yet)
            if (experiment.sequencer.trial && experiment.sequencer.trial.time.start) {
               experiment.sequencer.trial.visitedTabs.pushStamped({
                  "tab": logger.flattenTab(tab)
               }, timestamp)
            }


            /* instrument showMore button and form elements*/

            if (tab.name == "General")

            // enable logging of showMoreOptions
               if (tab.name == "Shortcuts")
               wunderlistListeners.instrumentShowMoreButtonWhenReady();
         }
      }
   }


   // detect which tab is currently active
   wunderlistListeners.findActiveTab = function() {
      var temp = location.hash.split('/');
      var shortHash = temp[temp.length - 1];

      for (var i in model.tabs) {
         if (model.tabs[i].hash == shortHash)
            return model.tabs[i];
      }

      return false;
   }


   wunderlistListeners.instrumentShowMoreButtonWhenReady = function() {
      setTimeout(function() {
         if (!experiment.sequencer.trial)
            return;

         if ($("#settings button.show-advanced-shortcuts").length < 1)
            wunderlistListeners.instrumentShowMoreButtonWhenReady();
         else {
            console.log("instrumenting Wunderlist's showMore button...")
            model.wunderlistShowMore = false;

            $("#settings button.show-advanced-shortcuts").click(function() {
               model.wunderlistShowMore = !model.wunderlistShowMore;

               experiment.sequencer.trial.showMoreOptions.pushStamped({
                  "tab": "Shortcuts",
                  "action": model.wunderlistShowMore ? "show" : "hide"
               })
            })
         }
      }, 10)
   }


   // ensure that the UI reflects the state of the Backbone model
   function bindFormElementsRectifiers() {

      // create a reverse map of the options associated to a given formElement's id
      wunderlistListeners.associatedOptions = {};
      model.options.forEach(function(option) {
         wunderlistListeners.associatedOptions[option.formElement] = option;
      });

      // create an observer instance
      var observer = new MutationObserver(function(mutations) {
         mutations.forEach(function(mutation) {

            // find the div containing all the form elements
            if (mutation.addedNodes)
               for (var i = 0; i < mutation.addedNodes.length; i++) {
                  if ($(mutation.addedNodes[i]).hasClass("settings-content-inner")) {

                     rectify($(mutation.addedNodes[i]))
                  }
               }
         });
      });

      // configure the observer
      var target = document.querySelector('#modals');
      var config = {
         childList: true,
         subtree: true
      };

      observer.observe(target, config);
   }

   function rectify(arg) {
      var staticAncestor = arg || $(".settings-content-inner");

      // check select elements
      staticAncestor.find("select").each(function() {
         rectifyUIifNeeded($(this), $(this).val)
      })

      // check text input elements used for shortcuts
      staticAncestor.find("input.shortcut").each(function() {
         rectifyUIifNeeded($(this), $(this).val)
      })

      // check checkbox elements
      staticAncestor.find("input[type=checkbox]").each(function() {
         rectifyUIifNeeded($(this), curry($(this).prop, "checked"))
      })
   }

   function curry(fn, prop) {
      return function(arg) {
         console.log("curried function", prop, "called with arg", arg)
         if (typeof arg == "undefined")
            return fn(prop);
         else
            return fn(prop, arg);
      }
   }

   function rectifyUIifNeeded(formElement, accessor) {
      var id = formElement.prop('id');
      var option = wunderlistListeners.associatedOptions[id];

      if (accessor() != option.value) {
         console.log("Rectifying UI state of", option.id, "from", accessor(), "to", option.value)
         accessor(option.value);
      }
   }


   function bindSettingsListeners() {


      /*      formElements.forEach(function(selector) {

               $(document).on()
                  // Check if displayed value corresponds to the one in the model; otherwise update it
               if (selector.indexOf("select#") >= 0)
                  console.log($(selector).val());
               else if (selector.indexOf("input#") >= 0)
                  console.log($(selector).prop("checked"));
            });*/
   }




   return wunderlistListeners;
})();


/*

Since the state of Wunderlist UI seems, sometimes, to be disconnected from Wunderlist Backbone model,
I may have no choice but to implement the listeners (and setters!) myself.

Difficulties:
- they would have to be recreated every time a tab is visited -> not even! 
- What about shortcuts?

Annoyances:
- need to manually find the ids of each option (not standardized it seems)
- programatically changing the value of radios buttons, select and checkboxes DOES NOT update the Wunderlist model
  -> so I can only use it to make sure settings looks what they values are

$("select#"edit-start-of-week").val("sun")",
$("#"edit-sound-checkoff-enabled").prop("checked", false)",

For radio buttons, it seems that I need to use two functions:
// the short form without :checked doesn't work, because not part of a group
$("div[aria-label='settings_general_time_format'] input:checked").val()

$("div[aria-label='settings_general_time_format'] input[value='24 hour']").prop("checked",true)
OR
$("div[aria-label='settings_general_time_format'] input").val(["12 hour", "12 hour"])
*/
