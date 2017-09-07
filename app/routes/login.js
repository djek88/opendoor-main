const sha1 = require('sha1');
const User = require('../models/user.model');

module.exports = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }

  User.findOne({ email: req.body.email, password: sha1(req.body.password) }, (err, user) => {
    if (err || !user) {
      return res.redirect('/login?message=wrongloginorpassword');
    }

    req.session.user = user;

    res.cookie('_id', user._id);
    res.cookie('email', user.email);
    res.cookie('isAdmin', user.isAdmin);
    res.redirect('/');
  });
};
