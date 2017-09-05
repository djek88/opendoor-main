const fs = require('fs');

module.exports = (mongoose) => {
  const changeSchema = new mongoose.Schema({
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

  const PlaceChange = mongoose.model('change', changeSchema);

  return function PlaceChangeManager() {
    this.add = (data, callback) => {
      const change = new PlaceChange(data);
      change.save(callback);
    };

    this.find = PlaceChange.find.bind(PlaceChange);
    this.findOne = PlaceChange.findOne.bind(PlaceChange);

    this.findAll = (cb) => {
      PlaceChange.find({}).populate('user', 'name').populate('place').exec(cb);
    };

    this.acceptChange = async (id) => {
      const change = await PlaceChange.findOne({ _id: id }).exec();
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

    this.removeChange = async (id) => {
      const change = await PlaceChange.findOne({ _id: id }).exec();
      if (!change) throw new Error('Place change not found!');

      if (change.field === 'bannerPhoto' || change.field === 'leaderPhoto') {
        fs.unlink(global.appDir + global.imagesPath + change.value);
      }

      await change.remove();
    };
  };
};

