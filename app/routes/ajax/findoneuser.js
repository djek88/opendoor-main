const User = require('../../models/user.model');

module.exports = (req, res) => {
  if (!req.session.user && !req.session.user.isAdmin) return res.end();

  User.findById(req.params.id, (err, user) => {
    if (!err) {
      res.send(JSON.stringify(user));
    } else {
      res.send(JSON.stringify(err));
    }
  });
};
