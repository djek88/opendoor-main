module.exports = function(placeManager, countryList){


	
	return function (req, res) {
		if (req.query.withPlaces) {
			placeManager.getCountries(
				function(err, countries) {
					countries.sort();
					res.send(countries);
				}
			);
		}
		else {
			res.send(JSON.stringify(countryList.getNames()));
		}
	};
};