// > node scripts/results-parser.js
var filepath = 'results/pax-pilot.json';
var outputFilename = 'results/test.json';

Object.defineProperty(Object.prototype, "forEach", {
   value: function(callback) {
      Object.keys(this).forEach(function(key) {
         callback(this[key]);
      }, this)
   }
})

var fs = require('fs');

var user = JSON.parse(fs.readFileSync(filepath, 'utf8'));
console.log("Resuls file parsed: ", filepath)

for (var key in user) {
   if (key !== "options")
      delete user[key];
}

user.options.forEach(function(option) {
   delete option.tab.options;
})


fs.writeFile(outputFilename, JSON.stringify(user, null, 2), function(err) {
   if (err) {
      console.log(err);
   } else {
      console.log("JSON saved to " + outputFilename);
   }
});

/*var stream = fs.createWriteStream("results.csv");
stream.once('open', function(fd) {
   stream.write("My first row\n");
   stream.write("My second row\n");
   stream.end();
});*/
