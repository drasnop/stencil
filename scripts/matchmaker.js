$("#selector-panel").remove();
$('body').append("<div id='selector-panel'></div>")
$("#selector-panel").text("waiting for selector")

selector = '';
$('body').off().mousemove(function (e) {
   // to avoid unnecessary overhead
   if (getSelector(e.target) != selector) {

   // de-highlight previous elements
   $(selector).removeClass("highlighted");

   selector=getSelector(e.target)
   $("#selector-panel").text(selector+" ("+$(selector).length+")");

   // highlight all similar elements
   console.log($(selector).length)
   $(selector).addClass("highlighted")
 }
});

function getSelector(elm, depth){
   if(!elm.className)
   return "";

   var s="."+elm.className;
   if(s[s.length-1]==" ")
      s=s.slice(0, s.length-1);
   s=s.split(" ").join(".");
   return s;
}