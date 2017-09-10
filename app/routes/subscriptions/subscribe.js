/* eslint no-underscore-dangle: "off" */
const email = require('../../lib/email');
const Place = require('../../models/place.model');
const Subscription = require('../../models/subscription.model');

module.exports = (req, res, next) => {
  const data = {
    place: req.body.place,
    name: req.session.user ? req.session.user.name : req.body.name,
    email: req.session.user ? req.session.user.email : req.body.email,
    isConfirmed: !!req.session.user,
  };

  Place.findOne({ _id: data.place }, (err, place) => {
    if (err) return next(err);
    if (!place) return res.redirect('/error');

    Subscription.add(data, (err, subscription) => {
      if (err) {
        if (err.message === 'exists') {
          return res.redirect(`/error?message=subscriptionexists&back=${encodeURIComponent(`/places/${place.uri}`)}`);
        }
        return next(err);
      }

      if (subscription) {
        if (subscription.isConfirmed) {
          return res.redirect(`/message?message=subscriptionadded&back=${encodeURIComponent(`/places/${place.uri}`)}`);
        }

        const options = {
          id: subscription._id,
          recipientEmail: data.email,
        };

        return email.sendSubscriptionConfirmation(options, () => {
          res.redirect(`/message?message=verifysubscription&back=${encodeURIComponent(`/places/${place.uri}`)}`);
        });
      }


      res.redirect(`/error&back=${encodeURIComponent(`/places/${place.uri}`)}`);
    });
  });
};
