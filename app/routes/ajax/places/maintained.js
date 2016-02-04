module.exports = function(mongoose, placeManager){
	return function(req, res){
		if (req.session.user) {
			var maintainerId;
			if (req.params.id && req.session.user.isAdmin) {
				maintainerId = req.params.id;
			}
			else {
				maintainerId = req.session.user._id;
			}
			placeManager.find({isConfirmed: true, maintainer: mongoose.Types.ObjectId(maintainerId)}).populate('maintainer', 'name').exec(function (err, places) {
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