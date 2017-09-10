const PlaceNotification = require('../models/place.notification.model');

module.exports = (req, res, next) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)],
    // range: 10000,
  };

  PlaceNotification.subscribe(data, (err, placeNotify) => {
    if (err) return next(err);
    if (!placeNotify) return next(new Error('Error during subscribing!'));

    res.redirect('/message?message=notificationsaved');
  });
};
