/* generate the list of all the tasks used in the experiment, both in default and opposite of defaults */

fs = require("fs");
options = JSON.parse(fs.readFileSync("data/options_wunderlist.json", 'utf8'));
outputfile = "scripts/tasks.txt";

// creates a convenient enumerating (but non-enumerable!) function
Object.defineProperty(options, "forEach", {
   value: function(callback) {
      Object.keys(this).forEach(function(key) {
         callback(this[key]);
      }, this)
   }
})

// creates a convenient enumerating (but non-enumerable!) function
Object.defineProperty(options, "forEachInExperiment", {
   value: function(callback) {
      this.forEach(function(option) {
         if (!option.notUserAccessible && !option.notInExperiment)
            callback(option);
      })
   }
})

function complementValueOf(option, reverse) {

   // do not touch options that aren't part of the experiment
   if (option.notInExperiment)
      return option.value;

   // if it's a boolean option, flip it
   if (!option.values)
      return !option.value;

   // otherwise, for more than two values, find current index
   var index = getIndexOfValueInOption(option, option.value);

   // find a complement value
   if (reverse)
      index = (index - 1 + option.values.length) % option.values.length;
   else
      index = (index + 1) % option.values.length;

   return option.values[index].name;
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

function getInstructions(option, value) {

   // Check for explicit instructions for the "false" or values[1] case
   if (option.instructionsReverse) {
      // we must retrieve the label of the value, since we're storing only the string name of target values
      if ((typeof value === "boolean" && value) || (typeof value !== "boolean" && getIndexOfValueInOption(option, value) === 0))
         return option.instructions;
      else
         return option.instructionsReverse;
   }

   // Standard cases
   var instructions = option.instructions;

   // Other booleans: simply replace enable by disable
   if (!option.values) {
      if (value)
         return instructions;
      else
         return instructions.replace("Enable", "Disable")
   }

   // Non-booleans options (more than 2 values)

   // special case for show/hide
   if (option.id.indexOf("smartlist_") >= 0) {
      if (value === "visible" || value === "auto")
         return instructions;
      else
         return instructions.replace("show", "hide")
   }

   // Otherwise, simply build the instructions from the value labels
   var index = getIndexOfValueInOption(option, value);
   return instructions + " " + option.values[index].label;
}

// main loop
output = "";
counter = 0;
options.forEachInExperiment(function(option) {
   output += getInstructions(option, option.value) + "\n";
   output += getInstructions(option, complementValueOf(option, false)) + "\n";
   counter++;
})

fs.writeFile(outputfile, output, function(err) {
   if (err) {
      return console.log(err);
   }
   console.log(counter, "unique tasks written in: ", outputfile);
});
