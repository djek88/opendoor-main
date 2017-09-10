/* eslint no-underscore-dangle: "off" */

const ObjectId = require('mongoose').Types.ObjectId;
const Place = require('../../../models/place.model');

module.exports = (req, res) => {
  if (!req.session.user) return;

  const id = req.params.id && req.session.user.isAdmin ? req.params.id : req.session.user._id;

  Place
    .find({ isConfirmed: true, maintainer: ObjectId(id) })
    .populate('maintainer', 'name').exec((err, places) => {
      if (err) return res.send(JSON.stringify(err));

      res.send(JSON.stringify(places));
    });
};
