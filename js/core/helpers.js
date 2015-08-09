///////////    helper functions     ////////////////////

// return the objects that have the same options that the ones passed in argument
function haveSameOptions(input, options, reverse) {
   return input.filter(function() {
      return !reverse != !sameElements($(this).data("options"), options);
   })
}

// return the objects that have the same options that the ones passed in argument
function dontHaveSameOptions(input, options) {
   return haveSameOptions(input, options, true);
}

// return true if arrays a and b have the same elements (not necessarily in order)
function sameElements(a, b) {
   // assuming each element appears only once
   if (a.length != b.length)
      return false;

   for (var i in a) {
      if (b.indexOf(a[i]) < 0)
         return false;
   }
   return true;
}

// position the panel at the top right of the current anchor, if possible; otherwise flipfit it
function positionPanel() {
   $("#ad-hoc-panel").position({
      my: "left+10 top",
      at: "right top",
      of: model.selectedAnchor,
      collision: "flipfit fit"
   })
}

jQuery.fn.extend({
   robustHeight: function() {
      if (this.css("box-sizing") == "border-box")
         return this.outerHeight();
      else
         return this.height();
   }
})

jQuery.fn.extend({
   robustWidth: function() {
      if (this.css("box-sizing") == "border-box")
         return this.outerWidth();
      else
         return this.width();
   }
})

Math.mean = function(array) {
   var sum = 0;
   for (var i in array)
      sum += array[i]
   return sum / array.length;
}


// Debug only
function getscope() {
   scope = angular.element($("#ad-hoc-panel")).scope();
}

// Debug only
function getvalue(id) {
   var ancestor = $(".settings-content-inner");
   var ui;

   // check select elements
   ancestor.find("select").each(function() {
      if ($(this).prop("id") == model.options[id].formElement)
         ui = $(this).val();
   })

   // check text input elements used for shortcuts
   ancestor.find("input.shortcut").each(function() {
      if ($(this).prop("id") == model.options[id].formElement)
         ui = $(this).val();
   })

   // check checkbox elements
   ancestor.find("input[type=checkbox]").each(function() {
      if ($(this).prop("id") == model.options[id].formElement)
         ui = $(this).prop("checked");
   })

   // check the radio buttons group (here $(this) contains both radio buttons, so call only once)
   ancestor.find("div[aria-label='settings_general_time_format']").each(function() {
      if ($(this).attr("aria-label") == model.options[id].formElement)
         ui = $(this).children("input").filter(":checked").val();
   })

   var syncSetting = wunderlist.getAppValue(id);
   var mine = model.options[id].value;

   console.log(id, ui, syncSetting, mine);
   return;
}

function showModal() {
   angular.element($("#ad-hoc-panel")).scope().$evalAsync(function() {
      $("#instructions-modal").modal('show');

      // if there is a button, disable it
      // if the button isn't created yet, the new button will be disabled as per the template
      $("#modal-button").attr("disabled", "disabled")

      // enable the button after a delay based on a fast reading speed
      setTimeout(function() {
         $("#modal-button").removeAttr("disabled")
      }, model.modal.message.length / 36 * 1)
   })
}

function getIndexOfValueInOption(option, value) {
   var index;
   for (var i = 0; i < option.values.length; i++) {
      if (option.values[i].name === value) {
         index = i;
         break;
      }
   }
   return index;
}


// Extend the Array class to automatically add timestamps on various events, unless an explicit timestamp has been provided
function EventsQueue() {}

EventsQueue.prototype = Object.create(Array.prototype);
EventsQueue.prototype.pushStamped = function(object, timestamp) {
   object.timestamp = timestamp || performance.now();
   this.push(object);
}
EventsQueue.prototype.loggable = function() {
   var loggable = [];
   for (var i = 0; i < this.length; i++)
      loggable[i] = this[i];
   return loggable;
}
