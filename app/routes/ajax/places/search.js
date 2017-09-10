const http = require('http');
const Place = require('../../../models/place.model');

module.exports = (req, res) => {
  var data = req.query;

  if (data.lat && data.lng) {
    data.coordinates = parseCoordinates(data.lat, data.lng);
    Place.findNearby(data, sendPlacesList);
  } else if (data.byIp) {
    var userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    getLocationByIp(userIp, function(err, lat, lng) {
      if (err) return sendPlacesList(err);
      if (!lat || !lng) return sendPlacesList(new Error('Location didn\'t detected'));

      data.coordinates = parseCoordinates(lat, lng);
      Place.findNearby(data, function(err, results) {
        if (err) return sendPlacesList(err);

        results.lat = lat;
        results.lng = lng;
        sendPlacesList(null, results);
      });
    });
  } else {
    Place.findNearby(data, sendPlacesList);
  }

  function sendPlacesList(err, results) {
    if (err) return res.status(404).json(err);

    res.send(JSON.stringify(results));
  }
};

function getLocationByIp(ip, cb) {
  var url = 'http://freegeoip.net/json/' + ip;
  //var url = 'http://freegeoip.net/json/92.113.9.166';

  http.get(url, function(res) {
    var body = '';

    res.on('data', function(chunk) { body += chunk; });
    res.on('end', function() {
      body = JSON.parse(body);
      cb(null, body.latitude, body.longitude);
    });
  }).on('error', cb);
}

function parseCoordinates(lat, lng) {
  return [parseFloat(lng), parseFloat(lat)];
}

/*
module.exports = function(config, placeManager){
  return function (req, res) {
    var data = req.query;

    if (data.lat && data.lng) {
      data.coordinates = [parseFloat(data.lng), parseFloat(data.lat)];
    }

    placeManager.findNearby(data, function(err, results){
      if (err) return res.send(JSON.stringify(err));

      res.send(JSON.stringify(results));
    });
  };
}*/