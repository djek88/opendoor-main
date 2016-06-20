module.exports = function(placeManager){


	return function (req, res) {
		placeManager.getLocalities(req.query.country,
			function(err, localities) {

				localities.sort();
				res.send(localities);
			}
		);
	};
};