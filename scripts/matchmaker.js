$("#selector-panel").remove();
$('body').append("<div id='selector-panel'></div>")
$("#selector-panel").text("waiting for selector")

selector = '';
mapping = [];

// remove all events binding, to operate on a static page
$("*").off();

$('body').mousemove(function (e) {
   // to avoid unnecessary overhead
   if (getSelector(e.target) != selector) {

      // de-highlight previous elements
      $(selector).removeClass("highlighted");


      selector=getSelector(e.target)
      $("#selector-panel").text(selector+" ("+$(selector).length+")");

      // highlight all similar elements
      $(selector).addClass("highlighted")
   }
});

/*
   other exploration functions:
   decrease specificity= remove the last class in the list
   select parent (with same specificity)
*/

$("body").click(function(){
   if(selector==="")
      return;
   console.log("saving: ",selector)
   mapping.push({
      "selector":selector,
      "options":selector /* temporary fix */
   })
})

function getSelector(elm, depth){
   if(!elm.className)
   return "";

   var s="."+elm.className;
   if(s[s.length-1]==" ")
      s=s.slice(0, s.length-1);
   s=s.split(" ").join(".");
   return s;
}