/* eslint no-underscore-dangle: "off", eqeqeq: "off" */
const promisify = require('util').promisify;

module.exports = async (req, res, next) => {
  const placeChangeId = req.params.id;

  try {
    if (!req.session.user) throw new Error('Access denied');

    const placeChange = await global.placeChangeManager.findOne({ _id: placeChangeId }).exec();
    if (!placeChange) throw new Error('Place change not found!');

    const place = await global.placeManager.findOne({ _id: placeChange.place }).exec();
    if (!place) throw new Error('Place not found!');

    if (place.maintainer == req.session.user._id) {
      await global.placeChangeManager.acceptChange(placeChangeId);
    } else {
      throw new Error('You are not maintainer of this place!');
    }

    res.redirect(`/message?message=changeaccepted&back=${encodeURIComponent('/places/changes')}`);

    const claimedUser = await global.userManager.findOne({ _id: placeChange.user }).exec();
    if (!claimedUser) throw new Error('User who created claim to change, not found!');

    const notifyAboutAcceptedChanges = promisify(global.email.notifyAboutAcceptedChanges);
    await notifyAboutAcceptedChanges({ id: place._id, recipientEmail: claimedUser.email });
  } catch (err) {
    res.redirect(`/error&back=${encodeURIComponent('/places/changes')}`);
    next(err);
  }
};
