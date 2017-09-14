/* eslint no-underscore-dangle: "off", eqeqeq: "off" */
const PlaceChange = require('../../models/place.change.model');
const User = require('../../models/user.model');
const Place = require('../../models/place.model');
const email = require('../../lib/email');


module.exports = async (req, res, next) => {
  const placeChangeId = req.params.id;

  try {
    if (!req.session.user) throw new Error('Access denied');

    const placeChange = await PlaceChange.findOne({ _id: placeChangeId }).exec();
    if (!placeChange) throw new Error('Place change not found!');

    const place = await Place.findOne({ _id: placeChange.place }).exec();
    if (!place) throw new Error('Place not found!');

    if (place.maintainer == req.session.user._id) {
      await PlaceChange.acceptChange(placeChangeId);
    } else {
      throw new Error('You are not maintainer of this place!');
    }

    res.redirect(`/message?message=changeaccepted&back=${encodeURIComponent('/places/changes')}`);

    const claimedUser = await User.findOne({ _id: placeChange.user }).exec();
    if (!claimedUser) throw new Error('User who created claim to change, not found!');

    await email.send('notifyAboutAcceptedChanges', { recipientEmail: claimedUser.email, placeId: place._id });
  } catch (err) {
    res.redirect(`/error&back=${encodeURIComponent('/places/changes')}`);
    next(err);
  }
};
