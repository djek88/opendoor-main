module.exports = function(mongoose, placeManager){
	return function(req, res){
		if (req.session.user) {
			placeManager.find({maintainer: mongoose.Types.ObjectId(req.session.user._id)}).populate('maintainer', 'name').exec(function (err, places) {
				if (!err) {
					res.send(JSON.stringify(places));
				}
				else {
					res.send(JSON.stringify(err));
				}
			});
		}
	}
};