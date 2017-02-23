const sha1 = require('sha1');
const googleAnalytics = require('./googleAnalytics');

module.exports = function(userManager) {
	return function(req, res) {
		if (req.session.user) {
			return res.redirect('/');
		}

		if (req.body.email && req.body.password) {
			const usersData = {
				name: req.body.name,
				email: req.body.email,
				password: sha1(req.body.password)
			};

			userManager.register(usersData, function(err, user) {
				if (err) {
					const redirectUrl = err.message === 'alreadyregistered'
						? '/register?message=alreadyregistered'
						: '/error';

					return res.redirect(redirectUrl);
				}

				googleAnalytics.sendEvent({
					clientId: req.cookies._ga,
					eventCategory: 'authorization',
					eventAction: 'sign up'
				});

				res.redirect('/login?message=regsuccess');
			});
		}
	};
};