module.exports = function(subscriptionManager, sm, config, fs, path) {

	var json2csv = require('json2csv');
	var fields = [
		// Supports label -> simple path
		{
			label: 'Email',
			value: 'email',
			default: 'NULL'
		}
		, {
			label: 'Place ID',
			value: 'place.name',
			// default: 'NULL'
		}
		, {
			label: 'Place URI',
			value: 'place.uri',
			// default: 'NULL'
		}
		, {
			label: 'Place religion',
			value: 'place.religion',
			// default: 'NULL'
		}
		, {
			label: 'Place ID',
			value: 'place._id',
			// default: 'NULL'
		}
	];

	return function (req, res) {
		if (req.session.user && req.session.user.isAdmin) {
			subscriptionManager.find().populate('place', {name: 1, uri: 1, religion: 1, groupName: 1}).exec(function(err, subscriptions){

				json2csv({ data: subscriptions, fields: fields }, function(err, csv) {
					if (err) console.log(err);
					console.log(csv);
				});
				res.send('OK');
			});
		}
		else {
			res.redirect('/error');
		}

	};
};