module.exports = function(placeManager){
	return function (req, res) {
		if (req.session.user) {
			placeManager.findOne({_id: req.params.id}, function(err, place){
				if (err) {
					res.end();
				}
				console.log(place);
				if (place.maintainer == req.session.user._id) {
					place.updatedAt = new Date;
					place.save(function(){
						res.redirect('/message?message=placesaved');
					});
				}
				else {
					res.end();
				}
			})
		}
	};
};