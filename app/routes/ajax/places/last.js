const Place = require('../../../models/place.model');

module.exports = (req, res) => {
  Place
    .find({})
    .skip('-createdAt')
    .limit(5)
    .populate('maintainer', 'name')
    .exec((err, place) => res.send(JSON.stringify(err || place)));
};
