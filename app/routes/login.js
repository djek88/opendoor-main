const sha1 = require('sha1');

module.exports = function(userManager) {
	return function(req, res) {
		if (req.session.user) {
			return res.redirect('/');
		}

		userManager.findOne({email: req.body.email, password: sha1(req.body.password)}, function(err, user) {
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
};