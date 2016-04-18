module.exports = function(placeManager, mongoose){
	return function (req, res) {
		if (req.session.user) {


			var isAdding = !req.params.id;
			var message;
			var id;
			var placeId = req.body.place;
			if (isAdding) {
				id = mongoose.Types.ObjectId();
				message = 'eventadded';
			}
			else {
				id = mongoose.Types.ObjectId(req.params.id);
				message = 'eventsaved';
			}


			placeManager.findOne({_id: placeId}, function(err, place){
				if (!err && place && place.maintainer == req.session.user._id)	{
					var locationAsString = req.body.location.split(',');

					var startDate = null;
					var endDate = null;
					if (req.body.startDate) {
						startDate = new Date(req.body.startDate);
						startDate.nodeToUTC();
					}

					if (req.body.endDate) {
						endDate = new Date(req.body.endDate);
						endDate.nodeToUTC();
					}
					var data = {
						name: req.body.name
						,	startDate: startDate
						,	endDate: endDate
						,	description: req.body.description
						,	address: req.body.address
						, location: {
							type: 'Point',
							coordinates: [
								parseFloat(locationAsString[0]) || null
								, parseFloat(locationAsString[1]) || null
							]
						}
					};

					placeManager[isAdding ? 'addEvent' : 'editEvent'](isAdding ? placeId : id, data, function(err, place){
						if (!err && place) {
							res.redirect('/message?message=' + message + '&back=' + encodeURIComponent('/places/' + place.uri));
						}
						else {
							console.log(err);
							res.redirect('/error');
						}
					});
				}
				else {
					res.end();
				}

			});

		}
		else {
			res.end();
		}
	};
};