const mongoose = require('../lib/mongoose.js');
const Place = require('../models/place.model');
const email = require('../lib/email');

const Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
  },
});

Schema.statics.isExist = async function isExist(data) {
  const Claim = this;

  const claim = await Claim.findOne(data).exec();
  return !!claim;
};

Schema.statics.acceptClaim = async function acceptClaim(id) {
  const Claim = this;

  const claim = await Claim.findById(id)
    .populate('user')
    .exec();
  if (!claim) throw new Error('Claim not found!');

  await Place.setMaintainer(claim.place, claim.user._id);

  await claim.remove();

  await email.send('sendClaimConfirmation', { recipientEmail: claim.user.email, placeId: claim.place });
};

module.exports = mongoose.model('Claim', Schema);
