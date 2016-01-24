module.exports = function(denominationManager){
	return function (req, res) {
		var query = req.query;

		denominationManager.find(query, function(err, denominations){
			res.send(JSON.stringify(denominations));
		});
	};
};