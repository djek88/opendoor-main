module.exports = function(placeManager){
	return function (req, res) {
		if (req.session.user) {
			placeManager.findOne({_id: req.params.id}, function(err, place){
				if (!err && place && place.maintainer == req.session.user._id) {
					place.updatedAt = new Date;
					place.save(function(){
						res.redirect('/message?message=placesaved&back=' + encodeURIComponent('/places/' + place.uri));
					});
				}
				else {
					res.end();
				}
			})
		}
	};
};