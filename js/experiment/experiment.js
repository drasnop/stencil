/*
 * Static class to handle the set up, initialization and flow of the usabiity experiment.
 * It calls the tutorial and trials sequencers.
 */

var experiment = (function() {
   var experiment = {
      // random sequence of 8 numbers and letters used to identify participants (read from Wunderlist app if possible)
      "email": "lotaculi",
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
      // state of the options at the beginning of the first block, used to reset at the beginning of the second block
      "initialOptions": [],
      // list of all the trials completed so far for the experiment
      // used to compute current reward, and to generate questionnaires options at the end.
      "trials": []
   }


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

      // verify that this email appears in firebase
      logger.checkEmail(function() {
         logger.initialize(function() {
            experiment.generateInitialState(function() {
               logger.saveInitialState();

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

      if (experiment.condition > 0) {

         // enter customization mode, in case participants had closed it
         if (!customizationMode)
            enterCustomizationMode();

         // popup to explain what Customization Mode is
         model.modal.header = "Customization Mode";
         model.modal.message = "You are now in Customization Mode. The items that appear in white are customizable. Clicking on them brings up the settings associated with them.";
         model.modal.buttonLabel = "Ok";
         model.modal.green = false;
         model.modal.hideOnClick = false;

         model.modal.action = experiment.showPracticeTrialInstructions;

         showModal();
      } else {
         // otherwise, continue directly to the practice trial
         experiment.showPracticeTrialInstructions();
      }
   }


   /* Step 2: practice trial */

   // called at the end of the tutorial, just before the experiment trials start
   experiment.showPracticeTrialInstructions = function() {

      // construct a new TrialsSequencer object for the practice trial
      experiment.sequencer = new TrialsSequencer("practiceTrial", 1000, 2000, "Wrong selection", false, Trial, 0, 0, experiment.practiceTrialEnded);

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

      model.modal.header = "Practice trial";
      if (experiment.condition > 0)
         model.modal.message = "The next popup will ask you to change one setting.<br>First, look around to find which item this setting might be related to;<br>then click on that item.";
      else
         model.modal.message = "The next popup will ask you to change one setting. It's up to you to find in which tab it is.";
      model.modal.buttonLabel = "Ok";
      model.modal.green = true;
      model.modal.hideOnClick = false;
      model.modal.action = experiment.sequencer.start.bind(experiment.sequencer);

      showModal();
   }

   experiment.practiceTrialEnded = function() {

      // just to be sure, clean up again the explanatory popups
      if (experiment.condition > 0) {
         clearTimeout(correctHookNotSelectedTimer);
         model.unwatch("selectedOptions");
         model.options["smartlist_visibility_starred"].unwatch("value");
         experiment.sequencer.trial.cluster.unwatch("length");
      }

      model.progressBar.message = "";
      model.progressBar.buttonLabel = "";

      model.modal.header = "Congratulations!";
      model.modal.message = "You have completed the tutorial. You can now start the experiment.";
      model.modal.buttonLabel = "Ok";
      model.modal.green = true;
      model.modal.hideOnClick = false;
      model.modal.action = experiment.showExperimentTrialsInstructions;

      showModal();
   }


   /* Step 3: experiment trials, first block */

   // called at the end of the practice trial, just before the experiment trials start
   experiment.showExperimentTrialsInstructions = function() {

      // construct a new Trial sequencer
      experiment.sequencer = new TrialsSequencer("experimentTrials1", 800, 1500, "Wrong setting", false, Trial, 1, 20, experiment.firstBlockEnded);

      // store the current state of the options, for the second block
      // the use of the logger method is coincidential: it simply serves our purpose here well
      experiment.initialOptions = logger.compressAllUserAccessibleOptions();

      // popup: experiment instructions, start experiment trials
      model.modal.header = "Experiment";
      model.modal.message = "In each step, you will be asked to change <b>one setting</b> of Wunderlist. Take your time to read the instructions, then click \"Go!\" to begin. Please change the setting <b>as quickly and as accurately as possible</b>, then click the \"Next\" button.<br><br>" +
         "You won't be able to change your mind after clicking \"Next\". You will get an extra <b>$" + experiment.bonusTrial.toFixed(2) + "</b> for each setting correctly changed.";
      model.modal.buttonLabel = "Start";
      model.modal.green = true;
      model.modal.hideOnClick = false;
      model.modal.action = experiment.sequencer.start.bind(experiment.sequencer);

      showModal();
   }

   experiment.firstBlockEnded = function() {
      model.progressBar.message = "";
      model.progressBar.buttonLabel = "";

      var img = "<img src='//" + parameters.serverURL + "/img/yawning.jpg'>";

      model.modal.header = "Well done!";
      model.modal.message = "Now would be a good time to take a mini-break :)" + img;
      model.modal.buttonLabel = "Ok";
      model.modal.green = true;
      model.modal.hideOnClick = false;
      model.modal.action = experiment.showSecondBlockInstructions;

      showModal();
   }


   /* Step 4: experiment trials, second block */

   // called at the end of the practice trial, just before the experiment trials start
   experiment.showSecondBlockInstructions = function() {

      // construct a new Trial sequencer
      experiment.sequencer = new TrialsSequencer("experimentTrials2", 500, 1500, "Wrong setting", false, Trial, 21, 40, function() {
         // generate recognition questionnaire from the selection sequence, then callback to continue experiment
         sequenceGenerator.generateRecognitionQuestionnaire(experiment.experimentTrialsEnded);
      });

      // restore the options to their initial state
      experiment.referenceOptions = experiment.initialOptions;
      // resetSettingsIfNeeded will be called automatically in TrialsSequencer.start

      // popup: experiment instructions, start experiment trials
      model.modal.header = "Experiment, part 2";
      model.modal.message = "In the second (and last) part of the experiment, you will be asked to change <b>the same settings</b> again, but in a different order.";
      model.modal.buttonLabel = "Start";
      model.modal.green = true;
      model.modal.hideOnClick = false;
      model.modal.action = experiment.sequencer.start.bind(experiment.sequencer);

      showModal();
   }

   experiment.experimentTrialsEnded = function() {
      model.progressBar.message = "";
      model.progressBar.buttonLabel = "";

      model.modal.header = "Congratulations!";
      model.modal.message = "You have completed the experiment. Please go back to the instructions page to answer a questionnaire and get your verification code.";
      model.modal.buttonLabel = "Ok";
      model.modal.green = true;
      model.modal.hideOnClick = false;
      model.modal.action = function() {
         var scope = angular.element($("#ad-hoc-panel")).scope();
         scope.deleteAccount();
      }

      showModal();
   }


   return experiment;
})();
