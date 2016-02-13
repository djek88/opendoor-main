module.exports = function(placeChangeManager){
	return function (req, res) {
		if (req.session.user) {
			var id = req.params.id;
			placeChangeManager.removeChange(id, function(err, place){
				if (!err && place) {
					res.redirect('/message?message=changedenied&back=' + encodeURIComponent('/places/changes'));
				}
				else {
					res.redirect('/error&back=' + encodeURIComponent('/places/changes'));
				}
			});
		}
	};
};