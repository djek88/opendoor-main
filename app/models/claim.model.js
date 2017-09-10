const mongoose = require('../lib/mongoose.js');
const Place = require('../models/place.model');
const User = require('../models/user.model');
const email = require('../lib/email');

const Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'place',
  },
});

Schema.statics.add = function add(data, cb = () => {}) {
  const Claim = this;

  new Claim(data).save(cb);
};

Schema.statics.findAll = function findAll(cb) {
  const Claim = this;

  Claim.find({}).populate('user').populate('place').exec(cb);
};

Schema.statics.acceptClaim = function acceptClaim(id, cb = () => {}) {
  const Claim = this;

  Claim.findOne({ _id: id }, (err, claim) => {
    if (err) return cb(err);
    if (!claim) return cb(new Error('Claim not found!'));

    Place.setMaintainer(claim.place, claim.user, (err, place) => {
      if (err) return cb(err);
      if (!place) return cb(new Error('Place not found!'));

      User.findOne(claim.user, (err, user) => {
        email.sendClaimConfirmation({ id: claim.place, recipientEmail: user.email });
      });

      claim.remove({}, cb);
    });
  });
};

Schema.statics.removeClaim = function removeClaim(id, cb) {
  const Claim = this;
  Claim.findOneAndRemove({ _id: id }, cb);
};

module.exports = mongoose.model('Claim', Schema);
