module.exports = function(mongoose) {
	var denominationSchema = new mongoose.Schema({
				name: String
			, religion: String
		});

	var Denomination = mongoose.model('denomination', denominationSchema);

	function DenominationManager() {
		var self = this;
		this.add = function(data, callback) {
			var denomination = new Denomination({
					name: data.name
				, religion: data.religion
			});
			denomination.save(function (err, religionGroup) {
				if (typeof callback == 'function') {
					callback(err, religionGroup);
				}
			});
		};


		this.getAll = function(query, callback) {
			Denomination.find(query, callback);
		};

		this.find = function(query, cb) {
			Denomination.find(query, cb);
		};

		this.addIfNotExists = function(currDenominations, religion, callback) {
			var newDenominations = currDenominations.slice(0, currDenominations.length);
			Denomination.find({
				name: {
					$in: newDenominations
				}
			}, function(err, denominations){
				for (var i=0; i<denominations.length; i++) {
					var index = newDenominations.indexOf(denominations[i].name);
					if (index!=-1) {
						newDenominations.splice(index, 1);
						i--;
					}
				}
				for (var j=0; j<newDenominations.length; j++) {
					console.log('add denomination', {name: newDenominations[j], religion: religion});
					self.add({name: newDenominations[j], religion: religion});
				}
				if (typeof callback == 'function') {
					callback(err, denominations);
				}
			});
		}

	}
	return DenominationManager;
};

