const mongoose = require('mongoose');
const PlaceChange = require('../../../models/place.change.model');
const Place = require('../../../models/place.model');

module.exports = (req, res) => {
  if (!req.session.user) return;

  Place.find({maintainer: mongoose.Types.ObjectId(req.session.user._id)}).select('_id').exec(function (err, places) {
    if (!err) {
      var ids = [];
      for (var i=0; i<places.length; i++) {
        ids.push(places[i]._id);
      }
      PlaceChange.find({place: {'$in': ids}}).populate('user', 'name').populate('place').exec(function(err, changes){
        res.send(JSON.stringify(changes));
      });
    } else {
      res.send(JSON.stringify(err));
    }
  });
};