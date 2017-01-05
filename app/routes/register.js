module.exports = function(userManager, sha1){
	return function (req, res) {
		if (req.session.user) {
			res.redirect('/');
		}
		else {
			if(req.body.email && req.body.password) {
				userManager.register({name: req.body.name, email: req.body.email, password: sha1(req.body.password)}, function (err, user) {
					if (err) {
						switch (err.message) {
							case 'alreadyregistered':
								res.redirect('/register?message=alreadyregistered');
								break;
							default:
								res.redirect('/error');
								break;
						}
					}
					else {
						res.redirect('/login?message=regsuccess');
					}
				});
			}
		}
	};
};