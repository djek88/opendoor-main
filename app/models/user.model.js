const config = require('../config');
const mongoose = require('../lib/mongoose');
const Place = require('../models/place.model');

const Schema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: Boolean,
  maintainedPlaces: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Place',
  },
});

Schema.statics.register = function register(data, cb) {
  const User = this;
  // trim spaces
  data.email = data.email.replace(/^\s+/, '').replace(/\s+$/, '');

  if (!isValidEmail(data.email)) return cb(new Error('Email is not valid!'));

  const newUser = new User({
    name: data.name,
    email: data.email,
    password: data.password,
  });

  Promise.resolve()
  .then(checkIsAlreadyRegistered)
  .then(setPlacesMaintainer)
  .then(updateAndSaveUser)
  .then(cb.bind(null, null))
  .catch(cb);

  function checkIsAlreadyRegistered() {
    return new Promise((resolve, reject) => {
      User.findOne({ email: newUser.email }, (err, result) => {
        if (err) return reject(err);
        if (result) return reject(new Error('alreadyregistered'));

        resolve();
      });
    });
  }

  function setPlacesMaintainer() {
    return new Promise((resolve, reject) => {
      Place.find({
        addedByEmail: newUser.email,
        maintainer: { $exists: false },
      }, (err, places) => {
        if (err) return reject(err);
        if (!places.length) return resolve(places);

        const placeChangePromises = places.map(place => setMaintainer(place));

        Promise.all(placeChangePromises).then(resolve).catch(reject);
      });
    });
  }

  function updateAndSaveUser(places) {
    places.forEach((place) => {
      newUser.maintainedPlaces.push(place.id);
    });

    return newUser.save();
  }

  function setMaintainer(place) {
    place.addedByEmail = undefined;
    place.maintainer = newUser.id;

    return place.save();
  }
};

Schema.statics.search = function search(data, callback) {
  const User = this;
  let skipPosition;
  let limitPosition;
  const matchOption = {};
  const options = [{ $match: matchOption }];

  if (data.maintainers === 'true') {
    matchOption.maintainedPlaces = { $exists: true, $ne: [] };
  }

  if (data.email) {
    matchOption.email = new RegExp(data.email, 'i');
  }
  if (data.name) {
    matchOption.name = new RegExp(data.name, 'i');
  }

  if (data.skip) {
    skipPosition = options.push({ $skip: parseInt(data.skip, 10) });
  }
  if (data.limit) {
    let limit = parseInt(data.limit, 10);
    limit = limit > config.frontend.maxItemsPerPage ? config.frontend.maxItemsPerPage : limit;
    limitPosition = options.push({ $limit: limit });
  } else {
    limitPosition = options.push({ $limit: config.frontend.itemsPerPage });
  }

  User.aggregate(options, (err, users) => {
    options.push({ $group: { _id: null, count: { $sum: 1 } } });

    if (limitPosition) {
      options.splice(limitPosition - 1, 1);
    }
    if (skipPosition) {
      options.splice(skipPosition - 1, 1);
    }
    User.aggregate(options, (err, stats) => {
      // Place.populate(places, {path: "maintainer"}, (err, places) => {
      const response = {
        results: users,
        count: stats[0] ? stats[0].count : 0,
      };

      if (typeof callback === 'function') {
        callback(err, response);
      }
      // });
    });
  });
};

Schema.statics.removePlaceFromMaintenance = async function removePlaceFromMaintenance(id, placeId) {
  const User = this;

  const user = await User.findById(id).exec();
  if (!user) return;

  user.maintainedPlaces.pull(placeId);
  return user.save();
};

Schema.statics.addPlaceForMaintenance = async function addPlaceForMaintenance(id, placeId) {
  const User = this;

  const user = await User.findByIdAndUpdate(id, { $push: { maintainedPlaces: placeId } }).exec();
  if (!user) throw new Error('User not found!');

  return user;
};

module.exports = mongoose.model('User', Schema);

function isValidEmail(str) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(str);
}
