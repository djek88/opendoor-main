module.exports = function(placeManager) {
console.log('get fn');

	return function() {
		//console.log((new Date).toString());
		console.log('schedule started');

		var date = Date.today().add(-3).months();
		console.log(date);
		placeManager.find({maintainer: {$ne: null}, updatedAt: {$lte: date}}, function(err, places){
			console.log(places);
		});
	};
};

