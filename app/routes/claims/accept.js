const Claim = require('../../models/claim.model');

module.exports = async (req, res, next) => {
  try {
    if (!req.session.user && !req.session.user.isAdmin) throw new Error('Access denied!');

    await Claim.acceptClaim(req.params.id);
    res.redirect(`/message?message=claimaccepted&back=${encodeURIComponent('/places/claims')}`);
  } catch (err) {
    next(err);
  }
};
