const mongoose = require('mongoose');

module.exports = (placeManager) => {
  return (req, res) => {
    const id = req.params[0];
    const isUri = id.indexOf('/') !== -1;
    const query = isUri ? { uri: id.toLowerCase() } : { _id: mongoose.Types.ObjectId(id) };

    placeManager.findOne(query).populate('maintainer', 'name').exec((err, place) => {
      if (err) return res.send(JSON.stringify(err));

      res.send(JSON.stringify(place));
    });
  };
};
