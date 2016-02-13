module.exports = function(placeChangeManager){
	return function (req, res) {
		if (req.session.user) {
			var id = req.params.id;


			placeChangeManager.findOne({_id: id}, function(err, placeChange){
				if (err) {
					res.end();
				}
				placeManager.findOne({_id: placeChange.place}, function(err, place){
					if (place.maintainer == req.session.user._id) {
						placeChangeManager.acceptChange(id, function (err, place) {
							if (!err && place) {
								res.redirect('/message?message=changeaccepted&back=' + encodeURIComponent('/places/changes'));
							}
							else {
								res.redirect('/error&back=' + encodeURIComponent('/places/changes'));
							}
						});
					}
					else {
						res.end();
					}
				});

			})

		}
	};
};