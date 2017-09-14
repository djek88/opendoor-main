const Claim = require('../../models/claim.model');

module.exports = async (req, res, next) => {
  try {
    if (!req.session.user && !req.session.user.isAdmin) throw new Error('Access denied!');

    const claim = await Claim.findByIdAndRemove(req.params.id).exec();
    if (!claim) return res.redirect(`/message?message=claimnotfound&back=${encodeURIComponent('/places/claims')}`);

    res.redirect(`/message?message=claimdenied&back=${encodeURIComponent('/places/claims')}`);
  } catch (err) {
    next(err);
  }
};
