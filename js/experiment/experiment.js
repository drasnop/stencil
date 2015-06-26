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
   "bonusTrial": 0.15,
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
         experiment.generateInitialState();

         experiment.setupComplete();
      });

      // if the email doesn't appear in firebase, cancel experiment
   }, experiment.cancel, messageEmailUnknown, messageExperimentAlreadyCompleted);
}


experiment.generateInitialState = function() {
   // 1: for some participants, use the opposite of the default options
   if (experiment.oppositeDefaults) {
      model.options.getUserAccessibleOptions().forEach(function(option) {
         option.value = sequenceGenerator.complementValueOf(option);
      });
   }

   // 2: store a correct version of the options, for future reference
   // the use of the logger method is coincidential: it simply serves our purpose here well
   experiment.referenceOptions = logger.compressAllUserAccessibleOptions();

   // 3: set the Wunderlist options to the default (or opposite default) settings 
   dataManager.initializeAppOptionsFromFile();

   // 4: randomly generate selection sequences
   sequenceGenerator.generateOptionsAndValuesSequences();

   // 5: save all of this generated data to firebase
   logger.saveInitialState();
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

experiment.setupComplete = function() {
   //setTimeout(experimentTrials.start.bind(experimentTrials), 1000); return;

   model.progressBar.message = "";
   model.progressBar.buttonLabel = "";

   model.modal.header = "Setup complete";
   model.modal.message = "Great! Everything is in place. Please follow this quick tutorial to see how Wunderlist works.";
   model.modal.buttonLabel = "Start";
   model.modal.green = true;
   model.modal.hideOnClick = false;

   model.modal.action = tutorial.start.bind(tutorial);

   showModal();
}

experiment.tutorialEnded = function() {
   model.progressBar.message = "";
   model.progressBar.buttonLabel = "";

   model.modal.header = "Congratulations!";
   model.modal.message = "You have completed the tutorial. You can now start the experiment.";
   model.modal.buttonLabel = "Ok";
   model.modal.green = true;
   model.modal.hideOnClick = false;

   model.modal.action = experimentTrials.start.bind(experimentTrials);

   showModal();
}

/* Step 2: experiment trials */
