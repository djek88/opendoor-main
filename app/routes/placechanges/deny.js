module.exports = function(placeChangeManager){
	return function (req, res) {
		if (req.session.user && req.session.user.isAdmin) {
			var id = req.params.id;
			placeChangeManager.removeChange(id, function(err, place){
				if (!err && place) {
					res.redirect('/message?message=changedenied');
				}
				else {
					res.redirect('/error');
				}
			});
		}
	};
};