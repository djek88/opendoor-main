const Claim = require('../../models/claim.model');

module.exports = (req, res, next) => {
  if (!req.session.user && !req.session.user.isAdmin) return next(new Error('Access denied!'));

  Claim.acceptClaim(req.params.id, (err, place) => {
    if (err) return next(err);
    if (!place) return res.redirect(`/error?back=${encodeURIComponent('/places/claims')}`);

    res.redirect(`/message?message=claimaccepted&back=${encodeURIComponent('/places/claims')}`);
  });
};
