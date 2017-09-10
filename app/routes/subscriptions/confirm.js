const Subscription = require('../../models/subscription.model');

module.exports = (req, res, next) => {
  Subscription.markAsConfirmed(req.params.id, (err, subscription) => {
    if (err) return next(err);
    if (!subscription) return res.redirect('/error?message=subscriptionconfirmationerror');

    res.redirect('/message?message=subscriptionconfirmed');
  });
};
