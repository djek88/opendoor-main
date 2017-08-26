module.exports = function(placeManager){
	return function(req, res) {
		if (!req.session.user) return res.redirect('/message?message=pleaselogin');

		var id = req.params.id;
		var data = {
			rating: req.body.rating,
			text: req.body.text,
			name: req.session.user.name
		};

		placeManager.addReview(id, data, function(err, place) {
			if (err || !place) return res.redirect('/error');

			res.redirect('/message?message=reviewsaved&back=' + encodeURIComponent('/places/' + place.uri));
		});
	};
};