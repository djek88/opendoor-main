module.exports = function(config, placeManager){
	return function (req, res) {
		var data = req.query;
		if (req.query.lat && req.query.lng) {
			data.coordinates = [
				parseFloat(req.query.lng)
				, parseFloat(req.query.lat)
			]
		}
		placeManager.findNearby(data, function(err, results){
			if (!err) {
				res.send(JSON.stringify(results));
			}
			else {
				res.send(JSON.stringify(err));
			}
		});
	};
}