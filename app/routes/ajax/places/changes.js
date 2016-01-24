module.exports = function(mongoose, placeManager, placeChangeManager){
	return function (req, res) {
		if (req.session.user) {
			placeManager.find({maintainer: mongoose.Types.ObjectId(req.session.user._id)}).select('_id').exec(function (err, places) {
				if (!err) {
					var ids = [];
					for (var i=0; i<places.length; i++) {
						ids.push(places[i]._id);
					}
					placeChangeManager.find({place: {'$in': ids}}).populate('user', 'name').populate('place').exec(function(err, changes){
						res.send(JSON.stringify(changes));
					});
				}
				else {
					res.send(JSON.stringify(err));
				}
			});
		}
	};
};