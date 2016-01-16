/**
 * Created by Vavooon on 14.01.2016.
 */

var lastTs = Date.now();
module.exports = {
	getUniqueFileName: function() {
		var currTs = Date.now();
		if (lastTs == currTs) {
			currTs++;
		}
		lastTs = currTs;
		return currTs;
	}
};