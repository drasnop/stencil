// Sort all options according to tab, then index
// If no tab nor index, put option at the end and sort alphabetically
var temp = [];

$.each(model.options, function(i, o) {
   temp.push(o);
});

temp.sort(function(a, b) {
   if(typeof a.tab == "undefined" && typeof b.tab != "undefined")
      return 1000;
   if(typeof a.tab != "undefined" && typeof b.tab == "undefined")
      return -1000;
   if(typeof b.tab == "undefined" && typeof a.tab == "undefined") {
      return a.id < b.id ? -1 : 1;
   }
   var ta = model.tabs.lookup[a.tab].index,
      tb = model.tabs.lookup[b.tab].index;
   if(ta != tb)
      return ta - tb;
   return a.index - b.index;
})

copy(temp)
