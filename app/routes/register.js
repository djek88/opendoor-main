/* eslint no-underscore-dangle: "off" */

const sha1 = require('sha1');
const googleAnalytics = require('./googleAnalytics');

module.exports = (userManager) => {
  return handler;

  function handler(req, res) {
    if (req.session.user) {
      return res.redirect('/');
    }

    if (req.body.email && req.body.password) {
      const usersData = {
        name: req.body.name,
        email: req.body.email,
        password: sha1(req.body.password),
      };

      userManager.register(usersData, (err) => {
        if (err) {
          const redirectUrl = err.message === 'alreadyregistered'
            ? '/register?message=alreadyregistered'
            : '/error';

          return res.redirect(redirectUrl);
        }

        googleAnalytics.sendEvent({
          _ga: req.cookies._ga,
          eventCategory: 'authorization',
          eventAction: 'sign up',
        });

        res.redirect('/login?message=regsuccess');
      });
    }
  }
};
