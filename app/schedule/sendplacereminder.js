const Place = require('../models/place.model');
const email = require('../lib/email');

module.exports = function sendPlaceReminder() {
  return () => {
    const date = Date.today().add(-3).months();

    Place
      .find({ maintainer: { $ne: null }, updatedAt: { $lte: date } })
      .populate('maintainer').exec((err, places) => {
        console.log(places);

        places.forEach(place => email.send('sendPlaceReminder', {
          placeId: place.id,
          recipientEmail: place.maintainer.email,
        }));
      });
  };
};
