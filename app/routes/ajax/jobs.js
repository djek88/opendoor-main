module.exports = function(mongoose, placeManager){
	return function (req, res) {
		var getById = req.params.id && req.params.id != 'search';
		if (getById) {
			var id = req.params.id;
			var query = {'jobs._id': mongoose.Types.ObjectId(id)};
		}
		else {
			var query = req.query;
		}


		placeManager.aggregate([
			{$match: query}
			, {$unwind: '$jobs'}
			, {$project: {_id: '$jobs._id', title: '$jobs.title', type: '$jobs.type', place: '$name', description: '$jobs.description', placeuri: '$uri', country: '$address.country'}}
		], function(err, jobs){
			res.send(JSON.stringify(getById ? jobs[0] : jobs));
		});

	};
};