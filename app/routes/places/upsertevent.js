const ObjectId = require('mongoose').Types.ObjectId;
const Place = require('../../models/place.model');

module.exports = (req, res) => {
  if (!req.session.user) return res.end();

  const isAdding = !req.params.id;
  const placeId = req.body.place;
  let id = ObjectId();
  let message = 'eventadded';

  if (!isAdding) {
    id = ObjectId(req.params.id);
    message = 'eventsaved';
  }

  Place.findOne({_id: placeId}, function(err, place) {
    if (!err && place && place.maintainer == req.session.user._id) {
      const locationAsString = req.body.location.split(',');

      let startDate = null;
      let endDate = null;

      if (req.body.startDate) {
        startDate = new Date(req.body.startDate);
        startDate.nodeToUTC();
      }

      if (req.body.endDate) {
        endDate = new Date(req.body.endDate);
        endDate.nodeToUTC();
      }

      const data = {
        name: req.body.name,
        startDate: startDate,
        endDate: endDate,
        description: req.body.description,
        address: req.body.address,
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(locationAsString[0]) || null,
            parseFloat(locationAsString[1]) || null
          ]
        }
      };

      Place[isAdding ? 'addEvent' : 'editEvent'](isAdding ? placeId : id, data, function(err, place) {
        if (err || !place) return res.redirect('/error');

        res.redirect('/message?message=' + message + '&back=' + encodeURIComponent('/places/' + place.uri));

        if (isAdding) {

        }
      });
    } else {
      res.end();
    }
  });
};
