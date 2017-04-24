module.exports = function sendPlaceReminder(placeManager, email) {
  return () => {
    console.log('schedule started');

    const date = Date.today().add(-3).months();
    console.log(date);

    placeManager
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
