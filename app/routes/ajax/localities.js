const Place = require('../../models/place.model');

module.exports = (req, res) => {
  Place.getLocalities(req.query.country, (err, localities) => {
    localities.sort();
    res.send(localities);
  });
};
