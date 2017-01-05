module.exports = function(placeManager, email) {
	return function() {
		console.log('schedule started');

		var date = Date.today().add(-3).months();
		console.log(date);
		placeManager.find({maintainer: {$ne: null}, updatedAt: {$lte: date}}).populate('maintainer').exec(function(err, places){
			console.log(places);
			for (var i=0; i<places.length; i++) {
				email.sendPlaceReminder({id: places[i]._id, recipientEmail: places[i].maintainer.email});
			}
		});
	};
};

