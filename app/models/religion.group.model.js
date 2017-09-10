const mongoose = require('../lib/mongoose.js');

const Schema = new mongoose.Schema({
  name: String,
  religion: String,
});

Schema.statics.add = function add(data, cb = () => {}) {
  const ReligionGroup = this;

  new ReligionGroup({
    name: data.name,
    religion: data.religion,
  }).save(cb);
};

module.exports = mongoose.model('ReligionGroup', Schema);
