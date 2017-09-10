const Place = require('../../models/place.model');

module.exports = (req, res) => {
  if (!req.session.user) return;

  Place.findOne({ _id: req.params.id }, (err, place) => {
    if (!err && place && place.maintainer == req.session.user._id) {
      place.updatedAt = Date.now();
      place.save(() => res.redirect(`/message?message=placesaved&back=${encodeURIComponent(`/places/${place.uri}`)}`));
    } else {
      res.end();
    }
  });
};
