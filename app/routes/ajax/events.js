module.exports = function(mongoose, placeManager, config){
	return function (req, res) {
		var getById = req.params.id && req.params.id != 'search';
		var query;
		var limitPosition;
		if (getById) {
			var id = req.params.id;
			query = {'events._id': mongoose.Types.ObjectId(id)};
		}
		else {
			query = {};
			// query['events.endDate'] = {$gt: (new Date).add(1).day()};
		}

		var coordinates;
		if (req.query.lat && req.query.lng) {
			coordinates = [
				parseFloat(req.query.lng) || null
				, parseFloat(req.query.lat) || null
			];
		}

		var geoNearOption = {
			"near": {
				"type": "Point"
				,	"coordinates": coordinates
			}
			,	"distanceField": "distance"
			//,	"maxDistance": 2000
			,	"spherical": true
			,	"query": { "location.type": "Point" }
			, "includeLocs": 'events.location'
		};

		var options = [
			{$match: query}
			// , {$unwind: '$events'}
			// , {$project: {
			// 	_id: '$events._id'
			// 	, name: '$events.name'
			// 	, startDate: '$events.startDate'
			// 	, endDate: '$events.endDate'
			// 	, description: '$events.description'
			// 	, address: '$events.address'
			// 	, location: '$events.location'
			// 	, place: '$_id'
			// 	, distance: '$distance'
			// }}
			// , {$match:{expireDate: {$gt: new Date}}}
		];

		if (coordinates) {
			options.unshift({"$geoNear": geoNearOption}, {
				"$sort": {"distance": 1}},
				{ "$redact": {
					"$cond": [
						{ "$eq": [ "$location", "$$ROOT.location" ] },
						"$$DESCEND",
						"$$PRUNE"
					]
				}}
			);
		}


		if (req.query.limit) {
			var limit = parseInt(req.query.limit);
			limit = limit > config.frontend.maxItemsPerPage ? config.frontend.maxItemsPerPage : limit;
			limitPosition = options.push({"$limit": limit});
		}
		else {
			limitPosition = options.push({"$limit": config.frontend.itemsPerPage});
		}

		console.log(options);
		placeManager.aggregate(options, function(err, events){
			// if (err || !events) {
				console.log(arguments);
			// }
			res.send(JSON.stringify(getById ? events[0] : events));
		});

	};
};