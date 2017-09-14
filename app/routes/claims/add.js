const Place = require('../../models/place.model');
const Claim = require('../../models/claim.model');

module.exports = async (req, res, next) => {
  if (!req.session.user) return res.redirect('/message?message=pleaselogin');
  const placeId = req.params.id;
  const userId = req.session.user._id;

  try {
    const place = await Place.findById(placeId).exec();
    if (!place) return res.redirect('/notfound');

    const data = {
      user: userId,
      place: placeId,
    };

    if (await Claim.isExist(data)) {
      return res.redirect(`/message?message=claimealreadyexists&back=${encodeURIComponent(`/places/${place.uri}`)}`);
    }
    await new Claim(data).save();

    res.redirect(`/message?message=claimadded&back=${encodeURIComponent(`/places/${place.uri}`)}`);
  } catch (err) {
    next(err);
  }
};
