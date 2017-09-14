const Claim = require('../../models/claim.model');

module.exports = async (req, res, next) => {
  try {
    if (!req.session.user && !req.session.user.isAdmin) throw new Error('Access denied!');

    const claims = await Claim.find({}).populate('user').populate('place').exec();
    res.send(JSON.stringify(claims));
  } catch (err) {
    next(err);
  }
};
