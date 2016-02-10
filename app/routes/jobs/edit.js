module.exports = function(mongoose, placeManager) {
	return function (req, res) {
		if (!req.session.user) {
			return res.end();
		}
		var data = req.body;

		var isAdding = !req.params.id;
		if (isAdding) {
			var id = mongoose.Types.ObjectId();
		}
		else {
			var id = mongoose.Types.ObjectId(req.params.id);
		}

		placeManager.getById(data.place, function(err, place){
			if (err || !place || place.maintainer != req.session.user._id) {

				if (isAdding) {
					data.expireDate = new Date;
					placeManager.addJob(data.place, data, function(err, place){
						res.redirect('/jobs/fund/' + place.jobs.pop()._id);
					});
				}
				else {

				}
			}
			else {
				res.redirect('/error');
			}
		});

	}
};