/**
 * Created by Vavooon on 13.01.2016.
 */
function AbstractManager() {
	this.dropUndeclaredFields = function(fields) {
		if (!this.fields) {
			throw new Error('Manager should contain this.fields property');
		}
		for (var i in fields) {
			if(!this.fields.hasOwnProperty(i)) {
				delete fields[i];
			}
		}
	}
}

module.exports = AbstractManager;