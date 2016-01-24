module.exports = function(placeChangeManager){
	return function (req, res) {
		if (req.session.user && req.session.user.isAdmin) {
			var id = req.params.id;
			placeChangeManager.acceptChange(id, function(err, place){
				if (!err && place) {
					res.redirect('/message?message=changeaccepted');
				}
				else {
					res.redirect('/error');
				}
			});
		}
	};
};