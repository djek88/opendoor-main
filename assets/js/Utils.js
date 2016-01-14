/**
 * Created by Vavooon on 14.01.2016.
 */
RegExp.escape = function(s) {
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};