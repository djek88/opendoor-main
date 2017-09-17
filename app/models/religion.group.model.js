const mongoose = require('../lib/mongoose.js');

const Schema = new mongoose.Schema({
  name: String,
  religion: String,
});

Schema.index({ religion: 1, name: -1 }, { unique: true });

module.exports = mongoose.model('ReligionGroup', Schema);
