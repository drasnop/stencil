$("#selector-panel").remove();
$('body').append("<div id='selector-panel'></div>")
$("#selector-panel").text("waiting for selector")

selector = '';
target = false;
mappings = [];

// remove all events binding, to operate on a static page
$("*").off();

$('body').mousemove(function(e) {
   target = e.target;
   updateView(getSelector(target));
});


$("body").click(function() {
   if(selector === "")
      return;
   console.log("saving: ", selector)
   mappings.push({
      "selector": selector,
      "options": selector /* temporary fix */
   })
})

$("body").keypress(function(e) {
   console.log(e.which);

   // d: decresase specificity
   var newSelector, arr;
   if(e.which == 100) {
      arr = selector.split(".")
      if(arr.length > 2)
         arr.pop();
      newSelector = arr.join(".");

      console.log("decrease specificity")
      updateView(newSelector);
   }

   // e: expand to parent
   if(e.which == 101) {
      newSelector = target.parentNode.tagName.toLowerCase() + getSelector(target.parentNode);
      console.log("expand to parent node: " + target.parentNode.tagName.toLowerCase())
      updateView(newSelector);
   }
})


function getSelector(elm) {
   if(!elm.className)
      return "";

   var s = elm.className;

   // cleanup to remove any additional whitespace and my own added class
   var arr = s.split(" ");
   arr = arr.filter(function(n) {
      return n !== "" && n !== "highlighted";
   })

   // create CSS classes
   s = "." + arr.join(".");

   return s;
}

function updateView(newSelector) {
   // to avoid unnecessary overhead, update only if the selector has changed
   if(newSelector != selector) {

      // de-highlight previous elements
      $(selector).removeClass("highlighted");

      selector = newSelector;
      $("#selector-panel").text(selector + " (" + $(selector).length + ")");

      // highlight all similar elements
      $(selector).addClass("highlighted")
   }
}
