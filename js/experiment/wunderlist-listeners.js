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
        listeners for settings in Wunderlist UI
      */

      // create a reverse map of the options associated to a given formElement's id
      wunderlistListeners.associatedOptions = {};
      model.options.forEach(function(option) {
         if (option.formElement)
            wunderlistListeners.associatedOptions[option.formElement] = option;
      });

      // ensure that the UI reflects the state of the Backbone model
      bindUIRectifiersOnTabChange();

      // listener for each settings change in Wunderlist UI
      bindSettingsListeners();

      // old
      /*
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
*/

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


   // ensure that the UI reflects the state of the Backbone model, when changing tabs or opening the panel
   function bindUIRectifiersOnTabChange() {

      // create an observer instance
      var observer = new MutationObserver(function(mutations) {
         mutations.forEach(function(mutation) {

            // find the div containing all the form elements
            if (mutation.addedNodes)
               for (var i = 0; i < mutation.addedNodes.length; i++) {
                  if ($(mutation.addedNodes[i]).hasClass("settings-content-inner")) {

                     wunderlistListeners.rectifyUIifNeeded($(mutation.addedNodes[i]))
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

   // Ancestor provided when called after changing tabs, when settings-content-inner has just been created
   wunderlistListeners.rectifyUIifNeeded = function(ancestor) {
      // console.log("### rectifying UI if needed")
      ancestor = ancestor || $(".settings-content-inner");

      // check select elements
      ancestor.find("select").each(function() {
         rectifyFormElement($(this), $.fn.val);
      })

      // check text input elements used for shortcuts
      ancestor.find("input.shortcut").each(function() {
         rectifyFormElement($(this), $.fn.val);
      })

      // check checkbox elements
      ancestor.find("input[type=checkbox]").each(function() {
         rectifyFormElement($(this), curry($.fn.prop, "checked"));
      })

      // check the radio buttons group (should be called only once)
      ancestor.find("div[aria-label='settings_general_time_format']").each(function() {
         rectifyFormElement($(this), radioButtonsAccessor);
      })
   }

   function rectifyFormElement(formElement, accessor) {
      // get the corresponding, either with the elements #id or by the stupid aria label (for the radio buttons group)
      var option = wunderlistListeners.associatedOptions[formElement.prop("id") || formElement.attr("aria-label")];

      if (accessor.call(formElement) != option.value) {
         console.log("-- rectifying UI state of", option.id, "from", accessor.call(formElement), "to", option.value);
         accessor.call(formElement, option.value);
      }
      /*else
              console.log(option.id, "is", accessor.call(formElement), "==", option.value)*/
   }

   // Inspired from http://www.drdobbs.com/open-source/currying-and-partial-functions-in-javasc/231001821?pgno=2
   function curry(fn) {
      var stored_args = Array.prototype.slice.call(arguments, 1);

      return function() {
         var new_args = Array.prototype.slice.call(arguments);
         var args = stored_args.concat(new_args);
         //console.log("curried function called with args", args, "and this", this)
         return fn.apply(this, args);
      };
   }

   // because of the way radio buttons work, I cannot simply use currying
   function radioButtonsAccessor(arg) {
      if (typeof arg == "undefined")
         return $(this).children("input").filter(":checked").val();
      else {
         return $(this).children("input").val([arg, arg]);
      }
   }


   function bindSettingsListeners() {

      model.options.forEachUserAccessible(function(option) {

         $("#modals").on("change", "#" + option.formElement, function(event) {
            var newval;
            if (option.values)
               newval = $("#" + option.formElement).val();
            else
               newval = $("#" + option.formElement).prop("checked");

            // update the model accordingly
            oldval = option.value;
            option.value = newval;
            console.log("- updating:", option.id, "from", oldval, "to", option.value)

            // log this values change, without caring for visibility of anchors
            if (experiment.sequencer.trial) {
               experiment.sequencer.trial.logValueChange(option, oldval);
            }

            // notify angular of this change, to unlock the "done" button
            // the test for existing $digest cycle is for weird cases with INVALID shortcuts...
            var scope = angular.element($("#ad-hoc-panel")).scope();
            if (!scope.$$phase)
               scope.$apply();

         })

      });

   }




   return wunderlistListeners;
})();


/*
Since the state of Wunderlist UI seems, sometimes, to be disconnected from Wunderlist Backbone model,
I may have no choice but to implement the listeners (and setters!) myself.

Difficulties:
- they would have to be recreated every time a tab is visited -> not even, thanks to global .on()!
- What about shortcuts? -> just text fields

Annoyances:
- need to manually find the ids of each option (not standardized it seems)
- programatically changing the value of radios buttons, select and checkboxes DOES NOT update the Wunderlist model
  -> so I can only use it to make sure settings looks what they values are
*/
