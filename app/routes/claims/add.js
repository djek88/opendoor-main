const ObjectId = require('mongoose').Types.ObjectId;
const Place = require('../../models/place.model');
const Claim = require('../../models/claim.model');

module.exports = (req, res, next) => {
  if (!req.session.user) return res.redirect('/message?message=pleaselogin');

  const placeId = req.params.id;
  const data = {
    user: ObjectId(req.session.user._id),
    place: ObjectId(placeId),
  };

  Claim.add(data, (err) => {
    if (err) return next(err);

    Place.getById(placeId, (err, place) => {
      if (err) return next(err);
      if (!place) return next(new Error('Place not found!'));

      res.redirect(`/message?message=claimadded&back=${encodeURIComponent(`/places/${place.uri}`)}`);
    });
  });
};
