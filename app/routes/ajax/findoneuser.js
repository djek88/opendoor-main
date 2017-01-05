module.exports = function(userManager){
	return function (req, res) {
		if (req.session.user && req.session.user.isAdmin) {
			userManager.findById(req.params.id, function(err, user){
				if (!err) {
					res.send(JSON.stringify(user));
				}
				else {
					res.send(JSON.stringify(err));
				}
			});
		}
		else {
			res.end();
		}
	};
}