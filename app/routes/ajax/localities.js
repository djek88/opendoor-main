module.exports = function(placeManager){
	return function (req, res) {
		console.log(req.query);
		placeManager.getLocalities(req.query.country,
			function(err, localities) {
				//countries.sort();
				res.send(localities);
			}
		);
	};
};