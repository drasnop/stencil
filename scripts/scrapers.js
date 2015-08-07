// recursive exploration
var list = function(variable) {
   console.log("## " + variable);
   for (var m in variable) {
      console.log(m, variable[m]);
   }
   return;
}

// recursive exploration, print non-empty and non-functions
function list(variable) {
   console.log("## " + variable);
   for (var m in variable) {
      if (variable[m] != null && typeof variable[m] != typeof Function)
         console.log(m, variable[m]);
   }
   return;
}

// list all options, values
var listm = function(collection) {
   var models = collection.models;
   for (var m in models) {
      console.log(m, models[m].attributes.name, models[m].attributes.key, models[m].attributes.value)
   }
   return;
}
listm(sync.collections.settings);

// look for non-empty collections
for (var c in sync.collections) {
   if (sync.collections[c].models)
      console.log(c, sync.collections[c].models.length)
}

var regex = new RegExp("_", 'g');
for (var name in options) {
   var id = name.replace(regex, '-');
   var label = $("#" + id).attr("aria-label");
   if (label === undefined) {
      label = $("#edit-" + id).attr("aria-label");
   }
   if (label !== undefined) {
      console.log(label)
      options[name].label = label
   }
}

// print the list of all user accessible options, with interesting information
// must be called from customization mode on
var props = ["anchorable", "hasHookOrCluster", "hasVisibleHook", "hideable", "notInExperiment"]

model.options.forEachUserAccessible(function(option) {
   var line = [option.tab.name, option.index, option.id];

   var prop, value;
   for (var i in props) {
      prop = props[i];

      if (typeof option[prop] == typeof Function)
         value = option[prop]();
      else
         value = option[prop];

      line.push(value ? prop : "")
   }

   console.log(line.join(","))
})
