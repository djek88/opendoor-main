module.exports = function(config, placeManager){
	return function (req, res) {
		var data = req.query;

		if (data.lat && data.lng) {
			data.coordinates = [parseFloat(data.lng), parseFloat(data.lat)];
		}

		placeManager.findNearby(data, function(err, results){
			if (err) return res.send(JSON.stringify(err));

			res.send(JSON.stringify(results));
		});
	};
}