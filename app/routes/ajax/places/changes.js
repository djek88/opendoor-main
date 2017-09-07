const PlaceChange = require('../../../models/place.change.model');

module.exports = function(mongoose){
	return function (req, res) {
		if (req.session.user) {
			global.placeManager.find({maintainer: mongoose.Types.ObjectId(req.session.user._id)}).select('_id').exec(function (err, places) {
				if (!err) {
					var ids = [];
					for (var i=0; i<places.length; i++) {
						ids.push(places[i]._id);
					}
					PlaceChange.find({place: {'$in': ids}}).populate('user', 'name').populate('place').exec(function(err, changes){
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