module.exports = function(claimManager){
	return function (req, res) {
		if (req.session.user && req.session.user.isAdmin) {
			var id = req.params.id;
			claimManager.acceptClaim(id, function(err, place){
				if (!err && place) {
					res.redirect('/message?message=claimaccepted&back=' + encodeURIComponent('/places/' + place.uri));
				}
				else {
					res.redirect('/error&back=' + encodeURIComponent('/places/' + place.uri));
				}
			});
		}
	};
};