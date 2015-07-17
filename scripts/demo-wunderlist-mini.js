initialize();
setTimeout(function() {
   alert("This is a static version of Wunderlist, a popular Todo List application.");
   enterCustomizationMode();
   setTimeout(function() {
      alert("And this is our Customization Mode. The items that appear in white are customizable. Clicking on them brings up the related settings.")
   }, 500)
}, 500)
