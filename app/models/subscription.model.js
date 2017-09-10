const mongoose = require('../lib/mongoose.js');

const Schema = new mongoose.Schema({
  name: String,
  email: String,
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'place',
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

Schema.statics.add = function add(data, cb = () => {}) {
  const Subscription = this;

  Subscription.findOne({ email: data.email, place: data.place }, (err, oldSubscription) => {
    if (err) return cb(err);

    if (!oldSubscription || data.isConfirmed === false) {
      if (oldSubscription) oldSubscription.remove();

      new Subscription({
        name: data.name,
        email: data.email,
        place: data.place,
        isConfirmed: data.isConfirmed,
      }).save(cb);
    } else {
      cb(new Error('exists'), oldSubscription);
    }
  });
};

Schema.statics.markAsConfirmed = function markAsConfirmed(id, cb = () => {}) {
  const Subscription = this;

  Subscription.findOneAndUpdate({ _id: id, isConfirmed: false }, { isConfirmed: true }, cb);
};

module.exports = mongoose.model('Subscription', Schema);
