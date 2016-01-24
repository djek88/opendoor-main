module.exports = function(religionGroupManager){
	var extend = require('util')._extend;
	return function (req, res) {
		var query = extend({}, req.query);

		religionGroupManager.find(query, function(err, religionGroups){
			res.send(JSON.stringify(religionGroups));
		});
	};
};