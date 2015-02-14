function initialize() {
   customizationMode = false;

   /*--------  create customization panels   --------*/

   $("body").append("<div id='panels'></div>")
   $("#panels").append("<div id='ad-hoc-panel' ng-controller='optionsController' ad-hoc-panel></div>",
         "<a id='show-full-panel'>Other settings...</a>")

   angular.element(document).ready(function() {
      console.log("Bootstrapping Angular");
      angular.bootstrap(document, ['myApp']);
   });
}


function enterCustomizationMode() {
   customizationMode = true;
   console.log("customization mode on");
   angular.element($("#ad-hoc-panel")).scope().initializeOptions();

   /*------- dim the background --------*/

   $("body").children(":not(#panels)").addClass("dimmed");
   $("body").append("<div id='overlay'></div>");
   $("#panels").show(); //TODO: remove them, and try to recreate popup in enterCM()
   /*$("#overlay").css("opacity",".4");   transitions are too slow, alas*/
   // super annoying workaround because of the way they defined the background image
   $("head").append("<style id='special-style'> #wunderlist-base::before{" +
      "-webkit-filter: grayscale(70%); filter: grayscale(70%);} </style>");


   /*------------- generate hooks -------------*/

   $("body").append("<div id='hooks'></div>");

   // elements of the original interface that can serve to anchor (intrinsically or semantically) options
   var anchors;
   // clones of the anchors with which users interact in customization mode
   var hooks;

   // for each selector-options pairs, generate the appropriate hooks
   mappings.forEach(function(mapping) {

      /*------------- clone original anchors -------------*/

      anchors = $(mapping.selector);

      if(anchors.length === 0)
         console.log(mapping.selector, "failed to match any element for", mapping.options)

      // store the current coordinates
      anchors.each(function() {
         $(this).data("coordinates", $(this).offset());
         $(this).data("style", getRelevantCSS($(this), parentCSS));
      })
      anchors.find("*").each(function() {
         $(this).data("style", getRelevantCSS($(this), childrenCSS));
      })

      // clone with their data, but remove event binders with .off()
      hooks = anchors.clone(true).off();
      hooks.appendTo("#hooks");

      /*------------- create hooks -------------*/

      // position the hooks on top of the elements
      hooks.each(function() {
         //$(this).offset($(this).data("coordinates")); doesn't work
         $(this)
            .css($(this).data("style"))
            .attr('disabled', 'disabled')
            .removeAttr('href')
            .css({
               "left": $(this).data("coordinates").left + "px",
               "top": $(this).data("coordinates").top + "px"
            })
            .data("options", mapping.options);

         $(this).find("*").each(function() {
            $(this)
               .css($(this).data("style"))
               .attr('disabled', 'disabled')
               .removeAttr('href')
               .addClass("customizable-children");
         });

         mapping.options.forEach(function(option_id) {
            if(options[option_id].hidden){
               $(this).addClass("hidden")
               // add coordinates to hiddenAnchors
            }
         });
      })
      hooks.addClass("customizable");


      /*------------- bind listeners -------------*/

      // highlight all elements that share at least one option with the current one
      hooks.mouseenter(function() {
         filterByCommonOption($(".customizable"), $(this).data("options")).addClass("hovered");
      })

      hooks.mouseleave(function() {
         if(!nonZeroIntersection($(this).data("options"), model.selectedOptions))
            filterByCommonOption($(".customizable"), $(this).data("options")).removeClass("hovered");
      })

      // show a panel populated with only the relevant options
      hooks.click(function(event) {

         // update the content of the panel
         // deep copy in place of the selectedOptions, otherwise we would loose the pointer in angular $scope.model.selectedOptions
         angular.copy($(this).data("options"), model.selectedOptions)
         var scope = angular.element($("#ad-hoc-panel")).scope();
         // specific parameters to set
         scope.computeActiveTab();
         scope.resetViewParameters();
         scope.$apply();

         // remove previous highlighted hooks, if any
         $(".customizable").each(function() {
            if(!nonZeroIntersection($(this).data("options"), model.selectedOptions))
               filterByCommonOption($(".customizable"), $(this).data("options")).removeClass("hovered");
         })

         // update the position of the panel
         var that = $(this);
         $("#ad-hoc-panel").show()
         $("#ad-hoc-panel").position({
            my: "left+20 top",
            at: "right top",
            of: that,
            collision: "fit fit",
            using: function(obj, info) {

               // console.log(obj, info)

               $(this).css({
                  left: obj.left + 'px',
                  top: obj.top + 'px'
               });
            }
         })
      })
   });


   // TODO: group hiddenAnchors into +


   $("#overlay").click(function() {
      $("#ad-hoc-panel").hide();
      // just to be sure, cleanup selectedOptions without deleting the array
      model.selectedOptions.length = 0;
      $(".customizable").removeClass("hovered");

      // revert back to the minimal panel    
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.resetViewParameters();
      scope.$apply();
   })
}



///////////    Secondary functions     ////////////////////


$(document).keyup(function(e) {
   if(e.keyCode == KEYCODE_ESC) {
      exitCustomizationMode();
   }
});

function toggleCustomizationMode() {
   if(customizationMode === undefined)
      return;

   if(!customizationMode)
      enterCustomizationMode();
   else
      exitCustomizationMode();
}

function toggleOptionsVisibility() {
   var scope = angular.element($("#ad-hoc-panel")).scope();
   scope.model.optionsVisibility = (scope.model.optionsVisibility + 1) % 3;
   scope.resetViewParameters();
   scope.$apply();
   console.log("scope.model.optionsVisibility", scope.model.optionsVisibility);
}

function exitCustomizationMode() {
   customizationMode = false;
   console.log("customization mode off")

   $("#overlay, #hooks").remove();
   $("#special-style").remove();
   $("body").children().removeClass("dimmed");
   $("#panels").hide(); //TODO: remove them, and try to recreate popup in enterCM()
}



///////////    helper functions     ////////////////////



var parentCSS = ["padding-top", "padding-right", "padding-bottom", "padding-left",
   "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
   "margin-top", "margin-right", "margin-bottom", "margin-left",
   "box-sizing", "width", "height", "display", "float",
   "text-align", "font-size"
];

var childrenCSS = ["padding-top", "padding-right", "padding-bottom", "padding-left",
   "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
   "margin-top", "margin-right", "margin-bottom", "margin-left",
   "position", "top", "right", "bottom", "left",
   "box-sizing", "width", "height", "display", "float",
   "text-align", "font-size"
];

function getRelevantCSS(obj, relevantCSS) {
   var rules = {};
   for(var i in relevantCSS) {
      rules[relevantCSS[i]] = obj.css(relevantCSS[i]);
   }
   return rules;
}

// return the objects that have at least one option in common with the ones passed in argument
function filterByCommonOption(input, options) {
   return input.filter(function() {
      return nonZeroIntersection($(this).data("options"), options)
   });
}

// returns true if arrays a and b have at least one element in common
function nonZeroIntersection(a, b) {
   var intersection =
      a.filter(function(element) {
         return b.indexOf(element) != -1;
      });
   return intersection.length > 0;
}

Object.defineProperty(Array.prototype, "indexOfProperty", {
   value: function(name, value) {
      for(var i in this) {
         if(this[i][name] === value)
            return i;
      }
      return -1;
   }
});

// Debug only
function getscope() {
   scope = angular.element($("#ad-hoc-panel")).scope();
}
