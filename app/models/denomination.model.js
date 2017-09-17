const mongoose = require('../lib/mongoose.js');

const Schema = new mongoose.Schema({
  name: String,
  religion: String,
});

Schema.index({ religion: 1, name: -1 }, { unique: true });

Schema.statics.addIfNotExists = async function addIfNotExists(denominations, religion) {
  const Denomination = this;
  const newDenominations = denominations.slice(0);

  const oldDenominations = await Denomination.find({ name: { $in: newDenominations } }).exec();

  for (let i = 0; i < oldDenominations.length; i += 1) {
    const index = newDenominations.indexOf(oldDenominations[i].name);

    if (index !== -1) {
      newDenominations.splice(index, 1);
      i -= 1;
    }
  }

  const promices = newDenominations.map(name => new Denomination({ name, religion }).save());

  return Promise.all(promices);
};

module.exports = mongoose.model('Denomination', Schema);
