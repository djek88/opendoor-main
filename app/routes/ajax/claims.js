const Claim = require('../../models/claim.model');

module.exports = (req, res, next) => {
  if (!req.session.user && !req.session.user.isAdmin) return next('Access denied!');

  Claim.findAll((err, claims) => res.send(JSON.stringify(err || claims)));
};
