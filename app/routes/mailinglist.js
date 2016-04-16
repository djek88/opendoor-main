module.exports = function(subscriptionManager, sm, config, fs, path) {

	var json2csv = require('json2csv');
	var fields = [
		{
			label: 'Email',
			value: 'email'
		}
		, {
			label: 'Place ID',
			value: 'place.name'
		}
		, {
			label: 'Place URI',
			value: 'place.uri'
		}
		, {
			label: 'Place religion',
			value: 'place.religion'
		}
		, {
			label: 'Group name',
			value: 'place.groupName'
		}
		// , {
		// 	label: 'Place ID',
		// 	value: 'place._id'
		// 	// default: 'NULL'
		// }
	];

	return function (req, res) {
		if (req.session.user && req.session.user.isAdmin) {
			subscriptionManager.find().populate('place', {name: 1, uri: 1, religion: 1, groupName: 1}).exec(function(err, subscriptions){

				json2csv({ data: subscriptions, fields: fields }, function(err, csv) {
					if (err) {
						console.log(err);
						res.redirect('/error');
					}
					res.header('Content-Type', 'text/csv');
					res.header('Content-Disposition', 'attachment; filename=mailing_list.csv');
					res.send(csv);
				});
			});
		}
		else {
			res.redirect('/error');
		}

	};
};