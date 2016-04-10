/**
 * Created by vavooon on 09.04.16.
 */

$(function(){
	$('html').on('click', function (e) {
		var $el = $(e.target);
		if ($el.hasClass('link')) {
			if ($el.parent().hasClass('open')) {
				$el.parent().removeClass('open');
			}
			else {
				$('.nav.navbar-nav>li').removeClass('open');
				$el.parent().addClass('open');
			}
		}
		else {
			$('.nav.navbar-nav>li').removeClass('open');
		}
	});
});