const ObjectId = require('mongoose').Types.ObjectId;
const Place = require('../../../models/place.model');

module.exports = (req, res) => {
  const id = req.params[0];
  const isUri = id.indexOf('/') !== -1;
  const query = isUri ? { uri: id.toLowerCase() } : { _id: ObjectId(id) };

  Place.findOne(query).populate('maintainer', 'name').exec((err, place) => {
    if (err) return res.send(JSON.stringify(err));

    res.send(JSON.stringify(place));
  });
};
