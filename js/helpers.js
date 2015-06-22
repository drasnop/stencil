///////////    helper functions     ////////////////////

var parentCSS = ["padding-top", "padding-right", "padding-bottom", "padding-left",
   "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
   "margin-top", "margin-right", "margin-bottom", "margin-left",
   "box-sizing", "display", "float", "list-style",
   "text-align", "font-size"
];

function getRelevantCSS(obj, relevantCSS) {
   var rules = {};
   for (var i in relevantCSS) {
      rules[relevantCSS[i]] = obj.css(relevantCSS[i]);
   }
   rules["box-sizing"] = "content-box";
   return rules;
}

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

// Resize the panel to create a vertical scrollbar instead of overflowing
function adjustPanelHeight() {
   // we leave a margin of 30px below the panel
   var wh = window.innerHeight - 30;
   var top = $("#ad-hoc-panel").offset().top;

   $("#options-list").css("height", "");
   // we want to keep the tabs always visible, so resize only the options list
   if (top + $("#ad-hoc-panel").height() > wh) {
      $("#options-list").height(wh - top - $("#tabs").height());


      if ($("#ad-hoc-panel").offset().top < 30) {
         $("#ad-hoc-panel").offset({
            "top": 30
         });
         $("#options-list").height(wh - $("#ad-hoc-panel").offset().top - $("#tabs").height());
      }
   }

   //console.log("after adjustPanelHeight", $("#ad-hoc-panel").offset().top, $("#options-list").height())
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

// computes the Euclidian distance between two ghost anchors
function distance(ghost1, ghost2) {
   var x1 = parseInt(ghost1.css("left")) + ghost1.robustWidth() / 2;
   var x2 = parseInt(ghost2.css("left")) + ghost2.robustWidth() / 2;
   var y1 = parseInt(ghost1.css("top")) + ghost1.robustHeight() / 2;
   var y2 = parseInt(ghost2.css("top")) + ghost2.robustHeight() / 2;
   return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}


// Debug only
function getscope() {
   scope = angular.element($("#ad-hoc-panel")).scope();
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


/* randomness */

function randomElementFrom(array) {
   return array[randomIndexFrom(array)];
}

function randomIndexFrom(array) {
   return Math.floor(Math.random() * array.length);
}

function shuffleArray(array) {
   for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
   }
   return;
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

// arg: associate array {"tabName": number}
// returns: array of tabNames
function generateTabsSequenceWithoutConsecutiveTabs(numElementsPerTab) {
   var tabSequence;

   while (true) {
      tabSequence = [];

      // 1: generate array of elements to pick from
      var elements = [];
      for (var tab in numElementsPerTab) {
         for (var j = 0; j < numElementsPerTab[tab]; j++) {
            elements.push(tab);
         }
      }

      // 2: pick non-consecutive elements, trying up to 10 times before giving up
      var index;
      var element = "";
      var count = 0;

      while (elements.length && count < 10) {

         index = randomIndexFrom(elements);
         if (elements[index] !== element) {
            element = elements.splice(index, 1)[0];
            tabSequence.push(element);
            count = 0;
         } else {
            // try again, with a maximum of 10 times
            count++;
         }
      }

      if (count == 10)
         console.log("Tab sequence rejected", tabSequence.toString())
      else
         break;
   }

   console.log("Valid tab sequence found", tabSequence.toString())
   return tabSequence;
}


// Extend the Array class to automatically add timestamps on various events
function EventsQueue() {}

EventsQueue.prototype = Object.create(Array.prototype);
EventsQueue.prototype.pushStamped = function(object) {
   object.timestamp = performance.now();
   this.push(object);
}
EventsQueue.prototype.loggable = function() {
   var loggable = [];
   for (var i = 0; i < this.length; i++)
      loggable[i] = this[i];
   return loggable;
}
