


function Email (config, transporter) {
	var self = this;
	function getAdminEmails(callback) {
		global.userManager.find({isAdmin: true}, function (err, users) {
			if (err) {
				console.log(err);
			}
			else {
				var adminEmails = [];
				for (var i = 0; i < users.length; i++) {
					adminEmails.push(users[i].email);
				}
			}
			if (typeof callback == 'function') {
				callback(err, adminEmails);
			}
		})
	}
	this.send = transporter.sendMail.bind(transporter);

	this.sendNotificationAboutNewPlaceToAdmin = function(id, callback) {
		getAdminEmails(function(err, adminEmails) {
			var mailText = 'New place was added: ' +
				config.url + '/places/' + id;
			var mailOptions = {
				from: config.mailConfig.senderAddress,
				to: adminEmails,
				subject: 'New place notification',
				text: mailText
			};

			self.send(mailOptions, callback);
		});
	};

	this.sendNotificationAboutNewPlace = function(id, email, callback) {
		var mailText = 'New place near you was added: ' +
			config.url + '/places/' + id;
		var mailOptions = {
			from: config.mailConfig.senderAddress,
			to: email,
			subject: 'New place notification',
			text: mailText
		};

		self.send(mailOptions, callback);
	};

	this.sendConfirmationLink = function(id, email, callback) {
		var mailText = 'Thank you for adding a place!\n' +
			'Please confirm it by passing the link: ' +
			config.url + '/places/confirm/' + id;
		var mailOptions = {
			from: config.mailConfig.senderAddress,
			to: email,
			subject: 'Place confirmation',
			text: mailText
		};

		this.send(mailOptions, callback);
	};

	this.sendFeedback = function(options, callback) {
		getAdminEmails(function(err, adminEmails) {
			var mailText = 'User: ' + options.name +
				'\nEmail: ' + options.email +
				'\nTarget page: ' + options.target +
				'\nNote: ' + options.note;

			var mailOptions = {
				from: config.mailConfig.senderAddress,
				to: adminEmails.join(', '),
				subject: 'Feedback about OpenDoor',
				text: mailText
			};

			self.send(mailOptions, callback);
		});
	};

	this.sendMessage = function(options, callback) {
		var mailText = 'Sender: ' + options.senderEmail + '\n' +
			'Subject: ' + options.subject + '\n' +
			'Message: ' + options.text;
		var mailOptions = {
			from: config.mailConfig.senderAddress,
			to: options.recipientEmail,
			subject: 'Message from OpenDoor.ooo',
			text: mailText
		};


		this.send(mailOptions, callback);
	};

	this.sendEditorProposal = function(options, callback) {
		var mailText = 'Someone asked you to be an editor of place: ' + config.url + '/places/' + options.id + '\n' +
			'You can claim to be editor by passing by the link: ' + config.url + '/claims/' + options.id + '/add' + '\n';
		var mailOptions = {
			from: config.mailConfig.senderAddress,
			to: options.recipientEmail,
			subject: 'Message from OpenDoor.ooo',
			text: mailText
		};


		this.send(mailOptions, callback);
	};
}

module.exports = Email;