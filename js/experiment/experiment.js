/*
 * Static class to handle the set up, initialization and flow of the usabiity experiment.
 * It calls the tutorial and trials sequencers.
 */

var experiment = {
   // random sequence of 8 numbers and letters used to identify participants (read from Wunderlist app if possible)
   "email": "lotaculi",
   // 0=control, 1=minimal, 2=mixed, 3=highlighted (set by logger.initialize)
   "condition": "",
   // whether to use the opposite values of the default options for this participant (set by logger.initialize)
   "oppositeDefaults": "",
   // bonus reward when trial done correctly
   "bonusTrial": 0.1,
   // list of options that users will be ask to find during the experiment
   "optionsSequence": [],
   // list of values that the options should be set at during the experiment
   "valuesSequence": []
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

   // 4: construct a new TrialsSequencer object
   experimentTrials = new TrialsSequencer("experimentTrials", 1000, 2000, "Wrong setting", false, Trial);

   // 5: randomly generate selection sequences
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
   //setTimeout(experimentTrials.start.bind(experimentTrials), 1000); return;

   // popup: setup complete, start tutorial
   model.progressBar.message = "";
   model.progressBar.buttonLabel = "";

   model.modal.header = "Setup complete";
   model.modal.message = "Great! Everything is in place. Please follow this quick tutorial to see how Wunderlist works.";
   model.modal.buttonLabel = "Start";
   model.modal.green = true;
   model.modal.hideOnClick = false;

   //model.modal.action = tutorial.start.bind(tutorial);
   model.modal.action = experimentTrials.start.bind(experimentTrials);

   // we may have to wait a few hundred msec for the angular app to be ready
   (function showModalIfBootstrapped() {
      if (typeof angular.element($("#ad-hoc-panel")).scope() != "undefined")
         showModal();
      else
         setTimeout(showModalIfBootstrapped, 100);
   })();
}

experiment.tutorialEnded = function() {

   // close customization panel, if it was still open
   if (experiment.condition > 0) {
      var scope = angular.element($("#ad-hoc-panel")).scope();
      scope.closePanel();
   }

   // popup: tutorial complete, start experiment trials
   model.progressBar.message = "";
   model.progressBar.buttonLabel = "";

   model.modal.header = "Congratulations!";
   model.modal.message = "You have completed the tutorial. You can now start the experiment.";
   model.modal.buttonLabel = "Ok";
   model.modal.green = true;
   model.modal.hideOnClick = false;

   model.modal.action = experiment.showInstructions;

   showModal();
}


/* Step 2: experiment trials */

// called at the end of the tutorial, just before the experiment trials start
experiment.showInstructions = function() {

   // popup: experiment instructions, start experiment trials
   model.modal.header = "Experiment";
   model.modal.message = "In each step, you will be asked to change <b>one setting</b> of Wunderlist. Take your time to read the instructions, then click \"Go!\" to begin. Please change the setting <b>as quickly and as accurately as possible</b>, then click the \"Next\" button.<br><br>" +
      "You won't be able to change your mind after clicking \"Next\". You will get an extra <b>$" + experiment.bonusTrial.toFixed(2) + "</b> for each setting correctly changed.";
   model.modal.buttonLabel = "Start";
   model.modal.green = true;
   model.modal.hideOnClick = false;
   model.modal.action = experimentTrials.start.bind(experimentTrials);

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
