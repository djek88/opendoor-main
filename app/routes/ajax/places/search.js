const http = require('http');

module.exports = function(config, placeManager) {
	return function(req, res) {
		var lat = req.query.lat;
		var lng = req.query.lng;
		var data = {};

		if (lat && lng) {
			data.coordinates = parseCoordinates(lat, lng);
			placeManager.findNearby(data, sendPlacesList);
		} else {
			var userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

			getLocationByIp(userIp, function(err, lat, lng) {
				if (err) return sendPlacesList(err);

				data.coordinates = parseCoordinates(lat, lng);
				placeManager.findNearby(data, function(err, results) {
					if (err) return sendPlacesList(err);

					results.lat = lat;
					results.lng = lng;
					sendPlacesList(null, results);
				});
			});
		}

		function sendPlacesList(err, results) {
			if (err) return res.status(404).json(err);

			res.send(JSON.stringify(results));
		}
	};
};

function getLocationByIp(ip, cb) {
	var url = 'http://freegeoip.net/json/' + ip;
	//var url = 'http://freegeoip.net/json/92.113.9.156';

	http.get(url, function(res) {
		var body = '';

		res.on('data', function(chunk) { body += chunk; });
		res.on('end', function() {
			body = JSON.parse(body);
			cb(null, body.latitude, body.longitude);
		});
	}).on('error', cb);
}

function parseCoordinates(lat, lng) {
	return [parseFloat(lng), parseFloat(lat)];
}