/**
 * Created by Vavooon on 14.01.2016.
 */
RegExp.escape = function(s) {
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

Array.cleanArray = function(actual) {
	var newArray = [];
	for (var i = 0; i < actual.length; i++) {
		if (actual[i]) {
			newArray.push(actual[i]);
		}
	}
	return newArray;
};

Array.prototype.cleanArray = function() {
	for (var i = 0; i < this.length; i++) {
		if (!this[i]) {
			this.splice(i--, 1);
		}
	}
	return this;
};

Date.prototype.nodeToUTC = function() {
	return this.add(-this.getTimezoneOffset()).minutes();
};


Date.prototype.browserToUTC = function() {
	return this.add(this.getTimezoneOffset()).minutes();
};

String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};