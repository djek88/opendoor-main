module.exports = function(userManager, sha1){
	return function (req, res) {
		if (req.session.user) {
			res.redirect('/');
		}
		else {
			if(req.body.email && req.body.password) {
				userManager.findOne({email: req.body.email, password: sha1(req.body.password)}, function (err, user) {
					if (user) {
						req.session.user = user;
						console.log(req.session.user);
						res.cookie('_id', user._id);
						res.cookie('email', user.email);
						res.cookie('isAdmin', user.isAdmin);
						res.redirect('/');
					}
					else {
						res.redirect('/login?message=wrongloginorpassword');
					}
				});
			}
			else {
				res.redirect('/login?message=wrongloginorpassword');
			}
		}
	};
};