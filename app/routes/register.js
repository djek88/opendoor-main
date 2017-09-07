/* eslint no-underscore-dangle: "off" */

const sha1 = require('sha1');
const User = require('../models/user.model');

module.exports = (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }

  if (req.body.email && req.body.password) {
    const usersData = {
      name: req.body.name,
      email: req.body.email,
      password: sha1(req.body.password),
    };

    User.register(usersData, (err) => {
      if (err) {
        const redirectUrl = err.message === 'alreadyregistered'
          ? '/register?message=alreadyregistered'
          : '/error';

        return res.redirect(redirectUrl);
      }

      res.redirect('/login?message=regsuccess');
    });
  }
};
