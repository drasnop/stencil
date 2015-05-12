var filepath = 'results/incandescent-torch-4042-mturk-export.json';

Object.defineProperty(Object.prototype, "forEach", {
   value: function(callback) {
      Object.keys(this).forEach(function(key) {
         callback(this[key]);
      }, this)
   }
})

var fs = require('fs');

var mturk = JSON.parse(fs.readFileSync(filepath, 'utf8'));
console.log("Resuls file parsed: ", filepath, mturk)


mturk.forEach(function(user) {
   user.trials.forEach(function(trial) {
      console.log(trial.number)
   })
})



/*var stream = fs.createWriteStream("results.csv");
stream.once('open', function(fd) {
   stream.write("My first row\n");
   stream.write("My second row\n");
   stream.end();
});*/
