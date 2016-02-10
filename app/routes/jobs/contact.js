module.exports = function(jobManager, email){
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

		console.log(data);
		jobManager.findOne({_id: id}, function(err, job) {
			if (job && job.email) {
				data.recipientEmail = job.email;
				email.sendJobMessage(data, function(){
					res.redirect('/message?message=messagesent')
				});
			}
			else {
				console.log(arguments);
			}
		});
	};
};
