const email = require('../../lib/email');
const Place = require('../../models/place.model');

module.exports = (req, res, next) => {
  Place.findOne({ _id: req.body.id }, (err, place) => {
    if (err) return next(err);
    if (!place) return next(new Error('Place not found!'));
    if (!place.email) return next(new Error('Place email not found!'));

    const options = {
      recipientEmail: place.email,
      senderEmail: req.session.user ? req.session.user.email : req.body.email,
      subject: req.body.subject,
      message: req.body.text,
    };

    email.send('sendMessage', options)
      .then(() => res.redirect(`/message?message=messagesent&back=${encodeURIComponent(`/places/${place.uri}`)}`))
      .catch(console.log.bind(console));
  });
};
