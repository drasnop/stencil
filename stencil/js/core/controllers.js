/* 
 * All 3 controllers of the app: for the options panel, the progress bar and the instructions dialog.
 */

app.controller('panelController', ['$scope', '$rootScope', '$window', '$timeout', '$http', function($scope, $rootScope, $window, $timeout, $http) {

   // provides access to model and other global objects in the html template
   $scope.model = $window.model;
   $scope.parameters = $window.parameters;
   $scope.experiment = $window.experiment;
   $scope.logger = $window.logger;
   $scope.dataManager = $window.dataManager;
   $scope.view = $window.view;
   $scope.geometry = $window.geometry;


   /* Manage Panel */

   // called when clicking on a hook
   $scope.showPanel = function() {
      if (!model.showPanel)
         model.showPanel = true;

      if (model.fullPanel())
         $scope.activateTab(computeActiveTab());
   }

   $scope.closePanel = function() {
      model.showPanel = false;

      // cleanup selectedOptions
      model.selectedOptions = [];

      // revert back to the minimal panel    
      $scope.resetViewParameters();
      $(".hook").removeClass("hovered");
   }

   $scope.resizePanel = function() {
      $("#ad-hoc-panel").css({
         "width": geometry.getPanelWidth() + 'px',
         "height": geometry.getPanelHeight() + 'px'
      })
   }

   $scope.expandToFullPanel = function(tab) {
      // stores the size of the panel before it is expanded
      var oldWidth = geometry.getPanelWidth();
      var oldHeight = geometry.getPanelHeight();

      model.panelExpanded = true;

      var newActiveTab = tab || computeActiveTab();
      $scope.activateTab(newActiveTab, true);
      // view.positionAllOptions has been called by activateTab, asking it to delay the entrance of non-highlighted options

      animatePanelExpansion();

      // to be safe: if the size of the panel hasn't changed after a while, force expansion
      setTimeout(function() {
         if ($("#ad-hoc-panel").width() == oldWidth || $("#ad-hoc-panel").height() == oldHeight)
            forceExpandPanel();
      }, 50);

      // to be super safe: if the size of the panel isn't close to what it's supposed to be, force expansion
      setTimeout(function() {
         if ($("#ad-hoc-panel").width() < 0.8 * geometry.getPanelWidth() || $("#ad-hoc-panel").height() < 0.8 * geometry.getPanelHeight())
            forceExpandPanel();
      }, parameters.panelSizeChangeDuration);


      // log
      if (experiment.sequencer.trial) {
         experiment.sequencer.trial.panel.pushStamped({
            "action": "expanded",
            "tab": newActiveTab.name
         });
      }
   }

   // animate the expansion of the panel, and update its position at the end if needed
   function animatePanelExpansion() {
      $("#ad-hoc-panel").animate({
         "width": geometry.getPanelWidth() + 'px',
         "height": geometry.getPanelHeight() + 'px'
      }, parameters.panelSizeChangeDuration, onPanelExpanded)
   }

   // skip the animation and set panel to full width
   function forceExpandPanel() {
      $("#ad-hoc-panel").width(geometry.getPanelWidth());
      $("#ad-hoc-panel").height(geometry.getPanelHeight());
      onPanelExpanded();
   }

   // callback after panel expansion animation completed
   function onPanelExpanded() {
      // if necessary, re-position panel to account for the larger size
      positionPanel();

      // if necessary, scroll down to bring first highlighted element into view
      $("#options-list").animate({
         scrollTop: computeScrollOffset()
      }, 300)
   }


   $rootScope.contractFullPanel = function() {
      // stores the size of the panel before it is expanded
      var oldWidth = geometry.getPanelWidth();
      var oldHeight = geometry.getPanelHeight();

      model.panelExpanded = false;

      // need this trick to make sure the non-selected options disappear immediately
      // otherwise their index is updated before their visibility, and they jump to the top of the tab for a split second...
      setTimeout(function() {
         // we must update the filtered index first, to compute the new size of the panel      
         view.positionAllOptions(true);
         animatePanelContraction();
      }, 0)


      // to be safe: if the size of the panel hasn't changed after a while, force contraction
      setTimeout(function() {
         if ($("#ad-hoc-panel").width() == oldWidth || $("#ad-hoc-panel").height() == oldHeight)
            forceContractPanel();
      }, 50, oldWidth, oldHeight);

      // to be super safe: if the size of the panel isn't close to what it's supposed to be, force contraction
      setTimeout(function() {
         if ($("#ad-hoc-panel").width() > 1.2 * geometry.getPanelWidth() || $("#ad-hoc-panel").height() > 1.2 * geometry.getPanelHeight())
            forceContractPanel();
      }, parameters.panelSizeChangeDuration);


      // log
      if (experiment.sequencer.trial) {
         experiment.sequencer.trial.panel.pushStamped({
            "action": "contracted",
            "tab": model.activeTab.name
         });
      }
   }

   // animate the contraction of the panel, and update its position at the end if needed
   function animatePanelContraction() {
      $("#ad-hoc-panel").animate({
         "width": geometry.getPanelWidth() + 'px',
         "height": geometry.getPanelHeight() + 'px'
      }, parameters.panelSizeChangeDuration, onPanelContracted);
   }

   // skip the animation and set panel to minimal width
   function forceContractPanel() {
      $("#ad-hoc-panel").width(geometry.getPanelWidth());
      $("#ad-hoc-panel").height(geometry.getPanelHeight());
      onPanelContracted();
   }

   // Update the position of the panel after contracting it, if needed
   function onPanelContracted() {
      positionPanel();
      angular.element($("#ad-hoc-panel")).scope().$apply();
   }


   $scope.activateTab = function(tab, delayEntrance) {

      model.activeTab = tab;

      // automatically bring highlighted options into view
      if (!model.activeTab.bloat) {

         // determine whether to show additional options or not
         model.activeTab.showMoreOptions = determineShowMoreOptions();

         // if necessary, scroll down to bring first highlighted element into view
         $("#options-list").animate({
            scrollTop: computeScrollOffset()
         }, 500)
      }

      // when the tab contains no highlighted option, scroll to top
      if (model.activeTab.bloat || model.activeTab.count === 0) {
         $("#options-list").scrollTop(0);
      }

      // update the position of the options to fit the new tab, which will also play ephemeral entrance animation
      view.positionAllOptions(delayEntrance);

      // saved visited tabs (count>0 indicates that the tab was highlighted)
      if (experiment.sequencer.trial) {
         experiment.sequencer.trial.visitedTabs.pushStamped({
            "tab": logger.flattenTab(tab)
         });
      }
   }

   // wrapper to allow cleaner logging
   $scope.updateAppOption = function(option, oldValue) {
      // store the old values before updating the underlying option, hence updating hooks and clusters
      var clusterExpanded = hooksManager.isClusterExpanded(option);
      var hadVisibleHook = option.hasVisibleHook();
      var ghost = option.ghost();

      dataManager.updateAppOption(option.id, option.value, true);

      // log
      if (experiment.sequencer.trial)
         experiment.sequencer.trial.logValueChange(option, oldValue, hadVisibleHook, clusterExpanded, ghost);
   }


   function computeScrollOffset() {
      // gather all the options highlighted in this tab
      var highlightedOptions = model.activeTab.options.filter(function(option) {
         return option.selected;
      })

      // for each option, compute the min and max scrollOffset that keep this option into view
      var viewport = parseInt($("#options-list").css("max-height"))
      var top,
         minimums = [],
         maximums = [];

      for (var i = 0; i < highlightedOptions.length; i++) {
         top = highlightedOptions[i].index * geometry.getOptionHeight();

         minimums.push(Math.max(top + geometry.getOptionHeight() - viewport, 0));
         maximums.push(top);
      }

      // find the optimal offset
      var offset = minimums[0];
      for (i = 0; i < highlightedOptions.length; i++) {
         if (minimums[i] < maximums[0]) {
            // the viewport is large enough to show both option 0 and i
            offset = minimums[i];
         } else {
            // the viewport is too small to show both option 0 and i
            // we move as far down as possible
            offset = maximums[0];
            break;
         }
      }
      return offset;
   }

   $scope.toggleShowMoreOptions = function() {
      model.activeTab.showMoreOptions = !model.activeTab.showMoreOptions;
      view.positionAllOptions();

      // log
      if (experiment.sequencer.trial) {
         experiment.sequencer.trial.showMoreOptions.pushStamped({
            "tab": model.activeTab.name,
            "action": model.activeTab.showMoreOptions ? "show" : "hide"
         })
      }
   }

   $scope.resetViewParameters = function() {
      model.panelExpanded = false;
      view.positionAllOptions();
      /*model.activeTab.showMoreOptions = false;*/
   }


   /* Reverse highlighting */


   // highlight all elements that share at least one option with the current one
   $scope.reverseHighlight = function(option) {
      if (!model.fullPanel())
         return;

      //  add blue highlight to the option checkbox / select
      $("#" + option.id).find(".formControl").addClass("blue-highlighted")

      // add blue highlight on the hooks and clusters containing this option
      $(".highlightable").filter(function() {
         return $(this).data("options").indexOf(option) >= 0;
      }).addClass("blue-highlighted")

      // log
      if (experiment.sequencer.trial)
         experiment.sequencer.trial.reverseHighlighted.pushStamped({
            "option_ID": option.id
         });
   }

   // remove highlight on mouseleave
   $scope.removeReverseHighlight = function(option) {
      if (!model.fullPanel())
         return;

      //  add blue highlight to the option checkbox / select
      $("#" + option.id).find(".formControl").removeClass("blue-highlighted")

      // add blue highlight on the hooks and clusters containing this option
      $(".highlightable").filter(function() {
         return $(this).data("options").indexOf(option) >= 0;
      }).removeClass("blue-highlighted")
   }

   $scope.filterOutBloatTabs = function(tab) {
      return !tab.bloat;
   }

   /* helper functions */


   // Determine which tab sould be active, buy computing which tab has the most highlighted options
   // in case of equality, the first tab will be chosen
   function computeActiveTab() {
      var max = 0;
      var argmax;
      model.tabs.forEachNonBloat(function(tab) {
         if (tab.count > max) {
            max = tab.count;
            argmax = tab;
         }
      })
      return argmax;
   }

   function determineShowMoreOptions() {
      if (!model.activeTab.hasMoreOptions)
         return false;

      // returns true if at least one highlighted option is under "show more"
      return model.activeTab.options.filter(function(option) {
         return option.selected && option.more;
      }).length > 0;
   }

}])


app.controller('instructionsModalController', ['$scope', '$window', function($scope, $window) {
   $scope.model = $window.model;
}])

app.controller('progressBarController', ['$scope', '$window', function($scope, $window) {
   $scope.model = $window.model;
   $scope.experiment = $window.experiment;
}])

app.controller('intermediateCtrl', function($scope) {

   $scope.likertScale = [-3, -2, -1, 0, 1, 2, 3];

   $scope.data = {};

   $scope.isDataValid = function() {
      return $scope.data.hasOwnProperty("easeOfUse") && $scope.data.hasOwnProperty("liking");
   }

   $scope.submitAndContinue = function() {
      console.log($scope.data);
      logger.firebase.child("/questionnaires/intermediate").child(experiment.condition).set($scope.data);
      $scope.data = {};
      model.modal.showIntermediate = false;
   }
})
