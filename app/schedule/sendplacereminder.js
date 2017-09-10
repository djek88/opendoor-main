const Place = require('../models/place.model');
const email = require('../lib/email');

module.exports = function sendPlaceReminder() {
  return () => {
    console.log('schedule started');

    const date = Date.today().add(-3).months();
    console.log(date);

    Place
      .find({ maintainer: { $ne: null }, updatedAt: { $lte: date } })
      .populate('maintainer').exec((err, places) => {
        console.log(places);

        places.forEach(place => email.sendPlaceReminder({
          id: place.id,
          recipientEmail: place.maintainer.email,
        }));
      });
  };
};
