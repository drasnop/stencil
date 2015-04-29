// recursive exploration
var list2=function(variable){
for(var m in variable) { console.log(variable); list(variable); } return; }

// list all options, values
var listm=function(models){ for(var m in models) { console.log(m, models[m].attributes.key, models[m].attributes.value) } return; }
listm(sync.collections.settings.models);

var regex = new RegExp("_", 'g');
for(var name in options){
	var id = name.replace(regex, '-');
    var label = $("#"+id).attr("aria-label");
    if(label===undefined){
		label = $("#edit-"+id).attr("aria-label");
    }
    if(label!==undefined){
	   console.log(label)
	   options[name].label=label
    }
}
