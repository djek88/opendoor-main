module.exports = function(config, placeManager){
	return function (req, res) {
		placeManager.find({}).skip('-createdAt').limit(5).populate('maintainer', 'name').exec(function(err, place){
			if (!err) {
				res.send(JSON.stringify(place));
			}
			else {
				res.send(JSON.stringify(err));
			}
		});
	};
};