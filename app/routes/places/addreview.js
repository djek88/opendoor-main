const Place = require('../../models/place.model');

module.exports = (req, res) => {
  if (!req.session.user) return res.redirect('/message?message=pleaselogin');

  const id = req.params.id;
  const data = {
    rating: req.body.rating,
    text: req.body.text,
    name: req.session.user.name,
  };

  Place.addReview(id, data, (err, place) => {
    if (err || !place) return res.redirect('/error');

    res.redirect(`/message?message=reviewsaved&back=${encodeURIComponent(`/places/${place.uri}`)}`);
  });
};
