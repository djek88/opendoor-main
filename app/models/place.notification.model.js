const mongoose = require('../lib/mongoose.js');

const Schema = new mongoose.Schema({
  email: String,
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [Number],
  },
  // range: Number,
});

Schema.index({ location: '2dsphere' });
Schema.set('autoIndex', true);

Schema.statics.subscribe = function subscribe(data, cb = () => {}) {
  const PlaceNotification = this;

  new PlaceNotification({
    name: data.name,
    email: data.email,
    location: {
      coordinates: data.coordinates,
    },
    // range: data.range,
  }).save(cb);
};

Schema.statics.findNearby = function findNearby(data, cb) {
  const PlaceNotification = this;
  const options = [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: data.coordinates,
        },
        distanceField: 'distance',
        maxDistance: 10000,
        spherical: true,
        query: { 'location.type': 'Point' },
      },
    }, {
      $sort: { distance: 1 }, // Sort the nearest first
    }, {
      $match: {},
    },
  ];
  // if (data.religion) {
  //  options[2]['$match']['religion'] = data.religion;
  // }
  // if (data.maxDistance) {
  //  options[0]['$geoNear'].maxDistance = parseInt(data.maxDistance);
  // }
  PlaceNotification.aggregate(options, cb);
};

module.exports = mongoose.model('PlaceNotification', Schema);
