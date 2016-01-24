module.exports = function(mongoose, placeManager){
	return function (req, res) {
		var id = req.params[0];
		if (id.indexOf('/') != -1) { //it seems to be uri
			var query = {uri: id};
		}
		else {
			var query = {_id: mongoose.Types.ObjectId(id)};
		}
		placeManager.findOne(query).populate('maintainer', 'name').exec(function(err, place){
			if (!err) {
				res.send(JSON.stringify(place));
			}
			else {
				res.send(JSON.stringify(err));
			}
		});
	};
};