module.exports = function(placeNotificationManager){
	return function (req, res) {
		var data = {
				name: req.body.name
			,	email: req.body.email
			,	coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)]
			//,	range: 10000
		};
		placeNotificationManager.subscribe(data);
		res.redirect('/message?message=notificationsaved');
		res.end();
	};
};