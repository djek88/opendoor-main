const mongoose = require('../lib/mongoose.js');

const Schema = new mongoose.Schema({
  name: String,
  religion: String,
});

Schema.statics.add = function add(data, cb = () => {}) {
  const Denomination = this;

  new Denomination({
    name: data.name,
    religion: data.religion,
  }).save(cb);
};

Schema.statics.addIfNotExists = function addIfNotExists(currDenominations, religion, cb = () => {}) {
  const Denomination = this;
  const newDenominations = currDenominations.slice(0, currDenominations.length);

  Denomination.find({ name: { $in: newDenominations } }, (err, denominations) => {
    for (var i=0; i<denominations.length; i++) {
      var index = newDenominations.indexOf(denominations[i].name);
      if (index!=-1) {
        newDenominations.splice(index, 1);
        i--;
      }
    }
    for (var j = 0; j < newDenominations.length; j++) {
      Denomination.add({ name: newDenominations[j], religion });
    }

    cb(err, denominations);
  });
};

module.exports = mongoose.model('Denomination', Schema);
