/*
 * Class to handle a sequence of Steps, between a start and an end.
 * Each Step is initialized, started and ended from its parent Sequencer.
 */

function Sequencer(name, firstTrialNumber, trialPauseSuccess, trialPauseFailure, errorMessage, forceRetry, trialConstructor, endCallback) {
   // name used to indentify the Sequencer in log messages
   this.name = name;
   // starting index of the trials (0 for )
   this.firstTrialNumber = firstTrialNumber;
   // duration of the brief pause between end of a successful trial and start of the next (in ms)
   this.trialPauseSuccess = trialPauseSuccess;
   // duration of the brief pause between end of a unsuccessful trial and start of the next (in ms)
   this.trialPauseFailure = trialPauseFailure;
   // error message displayed in the read button when !.trialSuccess()
   this.errorMessage = errorMessage;
   // whether to force the user to redo the same trial when !.trialSuccess()
   this.forceRetry = forceRetry;
   // constructor used to create new trials
   this.trialConstructor = trialConstructor;
   // callback to be called when the last step of this sequencer has been reached
   this.endCallback = endCallback;

   // whether this sequencer is playing (between start() and end()) 
   this.inProgress = false;
}

// generic trial constructor
function Step(number) {
   // trial number, starting at 0
   this.number = number;
   // whether the done button has been pressed, marking the end of the trial
   this.done = false;
   // whether the trial timedout before the done button was pressed
   this.timeout = false;
}

Sequencer.prototype.start = function() {
   console.log("Starting " + this.name)
   this.inProgress = true;

   angular.element($("#progress-bar")).scope().sequencer = this;
   angular.element($("#instructions-modal")).scope().sequencer = this;

   this.initializeTrial(this.firstTrialNumber);
}

Sequencer.prototype.initializeTrial = function(trialNumber, callback) {
   console.log(this.name + " initialize trial " + trialNumber)

   // creates a new trial, with the appropriate trial.number
   this.trial = new this.trialConstructor(trialNumber);

   model.progressBar.message = this.getInstructions();
   model.modal.header = this.getModalHeader();
   model.modal.message = this.getInstructions();
   model.modal.buttonLabel = "Go!";
   model.progressBar.buttonLabel = "Next";
   model.modal.action = this.startTrial.bind(this);
   model.modal.hideOnClick = true;
   model.modal.green = false;

   // Since the rendering of the modal is blocking, show it at the end of digest
   showModal();

   // this callback is used to log information, once the Trial object is initialized
   if (typeof callback === typeof Function)
      callback();
}

// called when the user clicks the "Go!" button in the modal
Sequencer.prototype.startTrial = function() {
   console.log(this.name + " trial " + this.trial.number + " started")
}

// called when the user clicks the "done" button in the progress bar
Sequencer.prototype.endTrial = function(callback) {
   console.log(this.name + " trial " + this.trial.number + " ended")
   this.trial.done = true;

   // this callback is used to update the view, after the model has been changed by setTimeout
   if (typeof callback === typeof Function)
      callback();

   if (this.forceRetry && !this.trialSuccess()) {
      setTimeout(this.initializeTrial.bind(this), 1000, this.trial.number);
      return;
   }

   if (this.notEndOfSequence()) {
      // after a brief pause, initialize next trial (passing it the next trial.number)
      setTimeout(this.initializeTrial.bind(this), this.trialSuccess() ? this.trialPauseSuccess : this.trialPauseFailure, this.trial.number + 1);
   } else
      this.end();
}

Sequencer.prototype.end = function() {
   this.inProgress = false;
   console.log(this.name + " ended");
   this.endCallback();
}

// just used for display
Sequencer.prototype.trialDone = function() {
   return this.trial.done;
}

// just used for display
Sequencer.prototype.trialTimeout = function() {
   return this.trial.timeout;
}



/* methods that need to be implemented by instances */

/* getModalHeader
   getInstructions
   trialNotPerformed
   trialSuccess
   getCurrentReward
   notEndOfSequence
*/
