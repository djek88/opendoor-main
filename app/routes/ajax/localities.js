module.exports = function(placeManager){
	return function (req, res) {
		placeManager.getLocalities(req.query.country,
			function(err, localities) {
				//countries.sort();
				res.send(localities);
			}
		);
	};
};