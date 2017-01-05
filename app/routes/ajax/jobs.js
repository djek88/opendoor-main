module.exports = function(mongoose, placeManager){
	return function (req, res) {
		var getById = req.params.id && req.params.id != 'search';
		var query;
		if (getById) {
			var id = req.params.id;
			query = {'jobs._id': mongoose.Types.ObjectId(id)};
		}
		else {
			query = req.query;
			query['jobs.expireDate'] = {$gt: (new Date).add(1).day()};
		}

		if (query.locality) {
			query['address.locality'] = query.locality;
			delete query.locality;
		}
		if (query.country) {
			query['address.country'] = query.country;
			delete query.country;
		}

		placeManager.aggregate([
			{$match: query}
			, {$unwind: '$jobs'}
			, {$project: {_id: '$jobs._id', title: '$jobs.title', expireDate: '$jobs.expireDate', type: '$jobs.type', place: '$name', description: '$jobs.description', placeuri: '$uri', country: '$address.country'}}
			, {$match:{expireDate: {$gt: new Date}}}
		], function(err, jobs){
			res.send(JSON.stringify(getById ? jobs[0] : jobs));
		});

	};
};