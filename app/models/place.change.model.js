const fs = require('fs');
const mongoose = require('../lib/mongoose');

const Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'place',
  },
  field: String,
  value: mongoose.Schema.Types.Mixed,
});

Schema.statics.add = function add(data, cb) {
  new this(data).save(cb);
};

Schema.statics.findAll = function findAll(data, cb) {
  this.find({}).populate('user', 'name').populate('place').exec(cb);
};

Schema.statics.acceptChange = async function acceptChange(id) {
  const change = await this.findOne({ _id: id }).exec();
  if (!change) throw new Error('Place change not found!');

  const place = await global.placeManager.findOne(change.place).exec();
  if (!place) throw new Error('Place not found!');

  if (place[change.field] && (change.field === 'bannerPhoto' || change.field === 'leaderPhoto')) {
    fs.unlink(global.appDir + global.imagesPath + place[change.field]);
  }
  place[change.field] = change.value;

  await place.save();
  await change.remove();

  return place;
};

Schema.statics.removeChange = async function removeChange(id) {
  const change = await this.findOne({ _id: id }).exec();
  if (!change) throw new Error('Place change not found!');

  if (change.field === 'bannerPhoto' || change.field === 'leaderPhoto') {
    fs.unlink(global.appDir + global.imagesPath + change.value);
  }

  await change.remove();
};

module.exports = mongoose.model('Change', Schema);
