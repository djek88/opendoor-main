module.exports = function(claimManager){
	return function (req, res) {
		if (req.session.user && req.session.user.isAdmin) {
			console.log('isadmin');
			var id = req.params.id;
			claimManager.acceptClaim(id, function(err, place){
				console.log(arguments);
				if (!err && place) {
					res.redirect('/message?message=claimaccepted&back=' + encodeURIComponent('/places/claims'));
				}
				else {
					res.redirect('/error?back=' + encodeURIComponent('/places/claims'));
				}
			});
		}
	};
};