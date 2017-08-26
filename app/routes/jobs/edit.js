module.exports = function(mongoose, placeManager) {
	return function(req, res) {
		if (!req.session.user) return res.end();

		var data = req.body;
		var isAdding = !req.params.id;
		var id = mongoose.Types.ObjectId();

		if (!isAdding) {
			var id = mongoose.Types.ObjectId(req.params.id);
		}

		placeManager.getById(data.place, function(err, place){
			if (err || !place || place.maintainer != req.session.user._id) {
				if (isAdding) {
					data.expireDate = new Date;
					placeManager.addJob(data.place, data, function(err, job) {
						res.redirect('/jobs/fund/' + job._id);
					});
				} else {

				}
			} else {
				res.redirect('/error');
			}
		});
	}
};