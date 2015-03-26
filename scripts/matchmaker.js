$("#selector-panel").remove();
$('body').append("<div id='selector-panel'></div>")
$("#selector-panel").text("waiting for selector")

selector = '';
mapping = [];

// remove all events binding, to operate on a static page
$("*").off();

$('body').mousemove(function (e) {
   updateView(getSelector(e.target));
});


$("body").click(function(){
   if(selector==="")
      return;
   console.log("saving: ",selector)
   mapping.push({
      "selector":selector,
      "options":selector /* temporary fix */
   })
})

$("body").keypress(function(e){
   console.log(e.which);
   
   // d: decresase specificity
   var newSelector, arr;
   if(e.which==100){
      arr=selector.split(".")
      if(arr.length>2)
         arr.pop();
      newSelector=arr.join(".");

      console.log("decrease specificity")
      updateView(newSelector);
   }
})

/*
   other exploration functions:
   decrease specificity= remove the last class in the list
   select parent (with same specificity)
*/

function getSelector(elm){
   if(!elm.className)
   return "";

   var s="."+elm.className, arr;
   if(s[s.length-1]==" ")
      s=s.slice(0, s.length-1);

   arr=s.split(" ");
   if(arr[arr.length-1]=="highlighted")
      arr.pop();

   s=arr.join(".");
   return s;
}

function updateView(newSelector){
   // to avoid unnecessary overhead, update only if the selector has changed
   if (newSelector != selector) {

      // de-highlight previous elements
      $(selector).removeClass("highlighted");

      selector=newSelector;
      $("#selector-panel").text(selector+" ("+$(selector).length+")");

      // highlight all similar elements
      $(selector).addClass("highlighted")
   }
}