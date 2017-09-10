const Place = require('../../models/place.model.js');

module.exports = (req, res) => {
  const id = req.params.id;

  Place.markAsConfirmed(id, (err, place) => {
    if (err || !place) return res.redirect('/error?message=placeconfirmationerror');

    res.redirect(`/message?message=placeconfirmed&back=${encodeURIComponent(`/places/${place.uri}`)}`);
  });
};
