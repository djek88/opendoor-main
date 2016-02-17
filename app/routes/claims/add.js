module.exports = function(mongoose, claimManager, placeManager){
	return function (req, res) {
		if (req.session.user) {
			var placeId = req.params.id;
			var data = {
				user: mongoose.Types.ObjectId(req.session.user._id)
				, place: mongoose.Types.ObjectId(placeId)
			};

			console.log('start');
			claimManager.add(data, function(err, claim){
				if (!err && claim) {
					console.log(claim);
					console.log('Claim for place ' + placeId + ' was added');
					placeManager.getById(placeId, function(err, place){
						res.redirect('/message?message=claimadded&back=' + encodeURIComponent('/places/' + place.uri));
					});
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