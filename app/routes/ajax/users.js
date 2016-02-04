module.exports = function(userManager){
	return function (req, res) {
		if (req.session.user.isAdmin) {
			var query = {};
			if (req.params.id) {
				query['_id'] = req.params.id;
			}

			userManager.find(query, function(err, users){
				if (!err) {
					res.send(JSON.stringify(users));
				}
				else {
					res.send(JSON.stringify(err));
				}
			})
		}
		else {
			res.end();
		}
	};
}