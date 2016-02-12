module.exports = function(mongoose, placeManager, email){
	return function (req, res) {
		var id = req.params.id;
		var data = {
			text: req.body.text
			, id: id
		};

		if (req.session.user) {
			data.senderEmail = req.session.user.email;
			data.name = req.session.user.name;
		}
		else {
			data.senderEmail = req.body.email;
			data.name = req.body.name;
		}


		placeManager.aggregate([
			{$match: {'jobs._id': mongoose.Types.ObjectId(id)}}
			, {$unwind: '$jobs'}
			, {$project: {_id: '$jobs._id', email: '$jobs.email', type: '$jobs.type'}}
		], function(err, jobs){
			if (jobs.length) {
				var job = jobs[0];
				if (job && job.email) {
					data.recipientEmail = job.email;
					console.log(data);
					email.sendJobMessage(data, function(){
						res.redirect('/message?message=messagesent')
					});
				}
				else {
					console.log(arguments);
					res.end();
				}
			}
			else res.end();
		});
	};
};
