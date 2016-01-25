module.exports = function(placeManager){
	return function (req, res) {
		var data = {
			coordinates: [
				parseFloat(req.query.lat)
				, parseFloat(req.query.lng)
			]
			,	religion: req.query.religion
			,	maxDistance: req.query.maxDistance
			,	limit: req.query.limit
			,	exclude: req.query.exclude
		};
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