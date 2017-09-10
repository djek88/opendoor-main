const Place = require('../../models/place.model');
const countryList = require('country-list')();

module.exports = (req, res) => {
  if (req.query.withPlaces) {
    return Place.getCountries(function(err, countries) {
      countries.sort();
      res.send(countries);
    });
  }

  res.send(JSON.stringify(countryList.getNames()));
};