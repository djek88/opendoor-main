module.exports = function(placeManager){
	return function (req, res) {
		if (req.session.user) {
			var id = req.params.id;
			var data = {
				rating: req.body.rating
				,	text: req.body.text
				,	name: req.session.user.name
			};

			placeManager.addReview(id, data, function(err, place){
				if (!err && place) {
					console.log('Review for place ' + id + ' was added');
					res.redirect('/message?message=reviewsaved&back=' + encodeURIComponent('/places/' + place.uri));
				}
				else {
					res.redirect('/error');
				}
			});
		}
		else {
			res.redirect('/message?message=pleaselogin');
		}
	};
};