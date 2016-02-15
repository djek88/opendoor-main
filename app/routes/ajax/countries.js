module.exports = function(countryList){
	return function (req, res) {
		console.log(countryList);
		res.send(JSON.stringify(countryList.getNames()));
	};
};