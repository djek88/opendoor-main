module.exports = function(placeManager){
	return function (req, res) {
		var data = {
				religion: req.query.religion
			,	maxDistance: req.query.maxDistance
			,	limit: req.query.limit
			,	exclude: req.query.exclude
			, name: req.query.name
			, maintained: req.query.maintained
		};
		if (req.query.lat && req.query.lng) {
			data.coordinates = [
				parseFloat(req.query.lat)
				, parseFloat(req.query.lng)
			]
		}
		placeManager.findNearby(data, function(err, places){
			if (!err) {
				res.send(JSON.stringify(places));
			}
			else {
				res.send(JSON.stringify(err));
			}
		});
	};
}