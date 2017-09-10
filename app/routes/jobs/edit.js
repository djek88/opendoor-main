const ObjectId = require('mongoose').Types.ObjectId;
const Place = require('../../models/place.model');

module.exports = (req, res) => {
  if (!req.session.user) return res.end();

  var data = req.body;
  var isAdding = !req.params.id;
  var id = ObjectId();

  if (!isAdding) {
    var id = ObjectId(req.params.id);
  }

  Place.getById(data.place, function(err, place) {
    if (err || !place || place.maintainer != req.session.user._id) {
      if (isAdding) {
        data.expireDate = new Date;
        Place.addJob(data.place, data, function(err, job) {
          res.redirect('/jobs/fund/' + job._id);
        });
      } else {

      }
    } else {
      res.redirect('/error');
    }
  });
};