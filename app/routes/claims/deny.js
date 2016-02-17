module.exports = function(claimManager){
	return function (req, res) {
		if (req.session.user && req.session.user.isAdmin) {
			var id = req.params.id;
			claimManager.removeClaim(id, function(err, place){
				if (!err && place) {
					res.redirect('/message?message=claimdenied&back=' + encodeURIComponent('/places/claims'));
				}
				else {
					res.redirect('/error&back=' + encodeURIComponent('/places/claims'));
				}
			});
		}
	};
};