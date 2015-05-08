function Sequencer(name, trialPause, trialConstructor) {
   // name used to indentify the Sequencer in log messages
   this.name = name;
   // current trial
   this.trial = {};
   // duration of the brief pause between end of a trial and start of the next (in ms)
   this.trialPause = trialPause;
   // constructor used to create new trials
   this.trialConstructor = trialConstructor || Step;
}

// generic trial constructor
function Step(number) {
   this.number = number;
   this.done = false;
}

Sequencer.prototype.start = function() {
   console.log("Starting " + this.name)
   model.controller = this;
   this.initializeTrial(0)
}

Sequencer.prototype.initializeTrial = function(trialNumber) {
   console.log(this.name + " initialize trial " + trialNumber)

   // creates a new trial, with the appropriate trial.number
   this.trial = new this.trialConstructor(trialNumber);

   model.modalHeader = this.getModalHeader();
   model.modalMessage = this.getInstructions();
   model.progressBarMessage = this.getInstructions();

   // Since the rendering of the modal is blocking, show it at the end of digest
   angular.element($("#ad-hoc-panel")).scope().$evalAsync(function() {
      $("#instructions-modal").modal('show');
   })
}

Sequencer.prototype.startTrial = function() {
   console.log(this.name + " trial " + this.trial.number)
}

Sequencer.prototype.endTrial = function() {
   console.log(this.name + " trial " + this.trial.number + " ended")
   this.trial.done = true;

   if(this.notEndOfSequence()) {
      // after a brief pause, initialize next trial (passing it the next trial.number)
      setTimeout(this.initializeTrial.bind(this), this.trialPause, this.trial.number + 1);
   }
   else
      this.end();
}

Sequencer.prototype.end = function() {
   console.log(this.name + " ended");
}

/*sequencer.getModalHeader = function(trialNumber) {
   return "";
}

sequencer.getInstructions = function(trialNumber) {
   return "";
}

sequencer.trialNotPerformed = function() {
   return false;

// test if the new index will get out of the bounds of the array
sequencer.notEndOfSequence = function() {
   return this.trial.number + 1 < this.trials.length;
}
}*/


Sequencer.prototype.trialDone = function() {
   return this.trial.done;
}

Sequencer.prototype.trialSuccess = function() {
   return true;
}
