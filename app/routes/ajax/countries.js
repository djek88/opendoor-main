var countryList = require('country-list')();

module.exports = function(placeManager){
	return function (req, res) {
		if (req.query.withPlaces) {
			return placeManager.getCountries(function(err, countries) {
				countries.sort();
				res.send(countries);
			});
		}

		res.send(JSON.stringify(countryList.getNames()));
	};
};