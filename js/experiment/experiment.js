/*
 * Static class to handle the set up, initialization and flow of the usabiity experiment.
 * It calls the tutorial and trials sequencers.
 */

var experiment = (function() {
   var experiment = {
      // random sequence of 8 numbers and letters used to identify participants (read from Wunderlist app if possible)
      "email": "lotaculi",
      // participantID, from 1 to 12 (0 is dev)
      "pid": 0,
      // 0=control, 1=minimal, 2=mixed, 3=highlighted (set by logger.initialize)
      "condition": "",
      // whether to use the opposite values of the default options for this participant (set by logger.initialize)
      "oppositeDefaults": "",
      // which set of options to use: 0 or 1
      "partition": "",
      // bonus reward when trial done correctly
      "bonusTrial": 0.05,
      // list of options that users will be ask to change during the experiment
      "optionsSequence": [],
      // list of values that the options should be set at during the experiment
      "valuesSequence": [],
      // the current sequencer object, used to guide participants through the different steps of the experiment workflow
      "sequencer": [],
      // a correct version of the options, used as a ground truth reference, and updated throughout the experiment
      "referenceOptions": [],
      // list of all the trials completed so far for the experiment
      // used to compute current reward, and to generate questionnaires options at the end.
      "trials": [],
      // current block (from 0 to experiment.conditions[].length, -1 before it starts)
      "block": -1
   }

   // all orders of conditions, blocked by interface type, for participants 1 to 12 (0 is dev)
   experiment.conditions = [
      [0, 1, 2, 3],
      [0, 1, 2, 3],
      [0, 1, 3, 2],
      [0, 2, 1, 3],
      [0, 2, 3, 1],
      [0, 3, 1, 2],
      [0, 3, 2, 1],
      [1, 2, 3, 0],
      [1, 3, 2, 0],
      [2, 1, 3, 0],
      [2, 3, 1, 0],
      [3, 1, 2, 0],
      [3, 2, 1, 0]
   ];


   /* Step 0: initialize experiment and logger, generate and save initial state, cancel experiment if needed   */

   /*
   CALLBACK HELL
   experiment.initialize
      logger.checkEmail
         logger.initialize
            experiment.generateInitialState
               sequenceGenerator.generateOptionsAndValuesSequences
                  logger.saveInitialState
                  experiment.setupComplete
   */

   experiment.initialize = function() {

      // retrieve the email used to create that Wunderlist account, otherwise a default email ("lotaculi") will be used
      if (typeof sync !== "undefined" && typeof sync.collections !== "undefined")
         experiment.email = sync.collections.users.models[0].get("email").split("@")[0];

      // prepare error messages for the error callbacks
      var messageEmailUnknown = "The email associated with this Wunderlist account (" + experiment.email + "@gmail.com) does not match the email you were given on the instructions page. " +
         "Please go back to step 2 of the instructions (Create temporary Wunderlist account). Otherwise you won't be able to collect your reward.";
      var messageExperimentAlreadyCompleted = "You can only participate in this experiment once. Please go back to the instructions page, and complete the questionnaires.";

      model.progressBar.message = "Checking if account is valid...";

      // verify that this email appears in firebase
      logger.checkEmail(function() {
         logger.initialize(function() {
            experiment.generateInitialState(function() {
               model.progressBar.message = "Saving initial state...";
               angular.element($("#progress-bar")).scope().$apply();

               logger.saveInitialState();

               // add listeners to Wunderlist
               wunderlistListeners.bindSettingsAndTabsListeners();

               // no need to wait for the Firebase acknowledgement to notify the user
               experiment.setupComplete();
            });
         });

         // if the email doesn't appear in firebase, cancel experiment
      }, experiment.cancel, messageEmailUnknown, messageExperimentAlreadyCompleted);
   }


   experiment.generateInitialState = function(callback) {
      // 1: for some participants, use the opposite of the default options
      if (experiment.oppositeDefaults) {
         model.options.forEachUserAccessible(function(option) {
            option.value = sequenceGenerator.complementValueOf(option);
         });
      }

      // 2: store a correct version of the options, for future reference
      // the use of the logger method is coincidential: it simply serves our purpose here well
      experiment.referenceOptions = logger.compressAllUserAccessibleOptions();

      // 3: set the Wunderlist options to the default (or opposite default) settings 
      dataManager.initializeAppOptionsFromFile();

      // 4: randomly generate selection sequences
      sequenceGenerator.generateOptionsAndValuesSequences(callback);

      // the callback will save all of this generated data to firebase
   }


   experiment.cancel = function(message) {
      model.progressBar.message = "";
      model.modal.header = "Verification failed!";
      model.modal.message = message;
      model.modal.buttonLabel = "Ok";
      model.modal.green = false;
      model.modal.hideOnClick = false;
      model.modal.action = function() {
         var scope = angular.element($("#ad-hoc-panel")).scope();
         scope.deleteAccount();
      }

      showModal();
   }


   /* Step 1: tutorial */

   // called when everything is set up, just before the tutorial starts
   experiment.setupComplete = function() {

      // this is a priori useless, and detrimental because we are checking if(experiment.sequencer.trial) for logging
      // experiment.sequencer = tutorial;

      // now that "experiment" exists, replace the end callback of tutorial (meh workaround)
      tutorial.endCallback = experiment.tutorialEnded;

      // popup: setup complete, start tutorial
      model.progressBar.message = "";
      model.progressBar.buttonLabel = "";

      model.modal.header = "Setup complete";
      model.modal.message = "Great! Everything is in place. Please follow this quick tutorial to see how Wunderlist works.";
      model.modal.buttonLabel = "Start";
      model.modal.green = true;
      model.modal.hideOnClick = false;

      model.modal.action = tutorial.start.bind(tutorial);
      //model.modal.action = experiment.showPracticeTrialInstructions;

      // we may have to wait a few hundred msec for the angular app to be ready
      (function showModalIfBootstrapped() {
         if (typeof angular.element($("#ad-hoc-panel")).scope() != "undefined")
            showModal();
         else
            setTimeout(showModalIfBootstrapped, 100);
      })();
   }

   experiment.tutorialEnded = function() {

      model.progressBar.message = "";
      model.progressBar.buttonLabel = "";

      // popup to explain what Customization Mode is
      model.modal.header = "Congratulations!";
      model.modal.message = "You have completed the tutorial. You can now start the experiment.";
      model.modal.buttonLabel = "Ok";
      model.modal.green = true;
      model.modal.hideOnClick = false;

      model.modal.action = experiment.showExperimentInstructions;

      showModal();
   }


   /* Step 2: practice trial */

   // called at the end of the practice trial, just before the experiment trials start
   experiment.showExperimentInstructions = function() {

      // popup: experiment instructions, start experiment trials
      model.modal.header = "Experiment";
      model.modal.message = "In each step, you will be asked to change <b>one setting</b> of Wunderlist. Take your time to read the instructions, then click \"Go!\" to begin. Please change the setting <b>as quickly and as accurately as possible</b>, then click the \"Next\" button.<br><br>" +
         "Note: you won't be able to change your mind after clicking \"Next\".";
      model.modal.buttonLabel = "Start";
      model.modal.green = true;
      model.modal.hideOnClick = false;
      model.modal.action = experiment.initializeBlock;

      showModal();
   }


   /* Step 2a: four blocks of experiment trials */

   // loop through the different blocks of the experiment, inserting the practice trial when needed
   experiment.initializeBlock = function() {

      // update parameters for the current block
      experiment.block++;
      experiment.condition = experiment.conditions[experiment.pid][experiment.block];
      model.optionsVisibility = experiment.condition;

      // decide whether to do the practice trial or start the block directly
      if ((experiment.pid <= 6 && experiment.block === 1) || (experiment.pid > 6 && experiment.block === 0))
         experiment.showPracticeTrialInstructions();
      else
         experiment.startBlock();

   }

   experiment.startBlock = function() {

      // construct a new Trial sequencer
      var startIndex = experiment.block * 10 + 1;
      var endIndex = (experiment.block + 1) * 10;
      experiment.sequencer = new TrialsSequencer("experimentTrials" + experiment.block, 800, 1500, 2, "Error :(", false, Trial, startIndex, endIndex, experiment.blockEnded);

      // popup: experiment instructions, start experiment trials
      model.modal.header = "Block " + (experiment.block + 1) + "/4";
      model.modal.message = "Please complete the following 10 trials.";
      model.modal.buttonLabel = "Start";
      model.modal.green = true;
      model.modal.hideOnClick = false;
      model.modal.action = experiment.sequencer.start.bind(experiment.sequencer);

      showModal();
   }


   // at the end of a block, offer a mini-break or end experiment
   experiment.blockEnded = function() {

      model.progressBar.message = "";
      model.progressBar.buttonLabel = "";

      var img = "<img src='//" + parameters.serverURL + "/img/yawning.jpg'>";

      model.modal.header = "Well done!";
      model.modal.message = "Now would be a good time to take a mini-break :)" + img;
      model.modal.buttonLabel = "Continue";
      model.modal.green = true;
      model.modal.hideOnClick = false;
      model.modal.showIntermediate = true;

      if (experiment.block + 1 < 4)
         model.modal.action = experiment.initializeBlock;
      else
         model.modal.action = experiment.experimentTrialsEnded;

      showModal();
   }


   /* Step 2b: practice trial */

   // called at the end of the tutorial, just before the experiment trials start
   experiment.showPracticeTrialInstructions = function() {

      // construct a new TrialsSequencer object for the practice trial
      experiment.sequencer = new TrialsSequencer("practiceTrial", 1000, 3000, 4, "Error :(", false, Trial, 0, 0, experiment.practiceTrialEnded);

      // replace the reward computation function for the practice trial sequencer (no reward)
      experiment.sequencer.getCurrentReward = function() {
         return -1;
      };
      // replace the trial performed test
      if (experiment.condition > 0) {
         experiment.sequencer.miniTutorialCompleted = false;
         experiment.sequencer.trialNotPerformed = function() {
            return !this.miniTutorialCompleted;
         }
      }

      // before showing the instructions, give participants some time to digest the customization mode
      $("#instructions-modal").modal('hide');
      $(".hidden-settings-style").remove();
      if (preferencesOpen)
         closePreferences();
      if (!customizationMode)
         enterCustomizationMode();

      setTimeout(function() {
         model.modal.header = "Practice trial";
         model.modal.message = "You are now in Customization Mode. The items that appear in white are customizable. Clicking on them brings up the settings associated with them.";
         //model.modal.message = "The next popup will ask you to change one setting.<br>First, look around to find which item this setting might be related to;<br>then click on that item.";
         model.modal.buttonLabel = "Ok";
         model.modal.green = true;
         model.modal.hideOnClick = true;
         model.modal.action = function() {
            setTimeout(experiment.sequencer.start.bind(experiment.sequencer), 2000);
         };

         showModal();
      }, 2000)

   }

   experiment.practiceTrialEnded = function() {

      // just to be sure, clean up again the explanatory popups
      if (experiment.condition > 0) {
         if (typeof correctHookNotSelectedTimer != "undefined")
            clearTimeout(correctHookNotSelectedTimer);
         if (typeof clusterExpandedTimer != "undefined")
            clearTimeout(clusterExpandedTimer);
         model.unwatch("selectedOptions");
         model.options["smartlist_visibility_starred"].unwatch("value");
         experiment.sequencer.trial.cluster.unwatch("length");
      }

      model.progressBar.message = "";
      model.progressBar.buttonLabel = "";

      model.modal.header = "Good job!";
      model.modal.message = "Now you can move on to the actual trials.";
      model.modal.buttonLabel = "Ok";
      model.modal.green = true;
      model.modal.hideOnClick = false;
      model.modal.action = experiment.startBlock;

      showModal();
   }


   /* Step 3: end experiment */

   experiment.experimentTrialsEnded = function() {
      model.progressBar.message = "";
      model.progressBar.buttonLabel = "";

      model.modal.header = "Congratulations!";
      model.modal.message = "You have completed the experiment.";
      model.modal.buttonLabel = "Ok";
      model.modal.green = true;
      model.modal.hideOnClick = true;
      model.modal.action = "";

      showModal();
   }


   return experiment;
})();
