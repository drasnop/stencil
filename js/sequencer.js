function Sequencer(name, trialPause, trialConstructor) {
   // name used to indentify the Sequencer in log messages
   this.name = name;
   // whether this sequencer is playing (between start() and end()) 
   this.inProgress = false;
   // current trial
   this.trial = {};
   // duration of the brief pause between end of a trial and start of the next (in ms)
   this.trialPause = trialPause;
   // constructor used to create new trials
   this.trialConstructor = trialConstructor || Step;
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

   this.initializeTrial(0)
}

Sequencer.prototype.initializeTrial = function(trialNumber, callback) {
   console.log(this.name + " initialize trial " + trialNumber)

   // creates a new trial, with the appropriate trial.number
   this.trial = new this.trialConstructor(trialNumber);

   model.progressBarMessage = this.getInstructions();
   model.modalHeader = this.getModalHeader();
   model.modalMessage = this.getInstructions();
   model.modalAction = this.startTrial.bind(this);

   // Since the rendering of the modal is blocking, show it at the end of digest
   showModal();

   // this callback is used to log information, once the Trial object is initialized
   if (typeof callback === typeof Function)
      callback();
}

// called when the user clicks the "go!" button in the modal
Sequencer.prototype.startTrial = function() {
   console.log(this.name + " trial " + this.trial.number + " started")
}

// called when the user clicks the "done" button in the progress bar
Sequencer.prototype.endTrial = function() {
   console.log(this.name + " trial " + this.trial.number + " ended")
   this.trial.done = true;

   if (this.notEndOfSequence()) {
      // after a brief pause, initialize next trial (passing it the next trial.number)
      setTimeout(this.initializeTrial.bind(this), this.trialPause, this.trial.number + 1);
   } else
      this.end();
}

Sequencer.prototype.end = function() {
   this.inProgress = false;
   console.log(this.name + " ended");
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
   notEndOfSequence
*/
