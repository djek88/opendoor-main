require.config({

	// alias libraries paths
	paths: {
		// 'angular': '../../bower_components/angular/angular'
		'angular': '../../bower_components/angular/angular.min'
		, 'libs/bootstrap': '../../bower_components/bootstrap/dist/js/bootstrap.min'
		, 'angular-route': '/bower_components/angular-route/angular-route.min'
		, 'angular-cookies': '/bower_components/angular-cookies/angular-cookies.min'
		, 'trumbowyg-ng': '/bower_components/trumbowyg-ng/dist/trumbowyg-ng.min'
		, 'libs/googlemaps': 'https://maps.googleapis.com/maps/api/js?key=' + siteconfig.apiKeys.googleMaps
		, 'libs/stripe': 'https://checkout.stripe.com/checkout'
		, 'libs/datetimepicker': '/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min'
		, 'libs/tagsinput': '/bower_components/bootstrap-tagsinput/dist/bootstrap-tagsinput.min'
		, 'libs/typeahead': '/assets/js/bootstrap3-typeahead'
		, 'libs/selectpicker': '/bower_components/bootstrap-select/dist/js/bootstrap-select.min'
		, 'libs/trumbowyg': '/bower_components/trumbowyg/dist/trumbowyg.min'
		, 'moment': '/bower_components/moment/min/moment.min'
		// ,   'bootstrap': '../../bower_components/bootstrap/dist/js/bootstrap'
	}

	// angular does not support AMD out of the box, put it in a shim
	, shim: {
		'angular': {
			exports: 'angular'
		},
		'angular-route': {
			exports: 'ngRoute',
			deps: ['angular']
		},
		'angular-cookies': {
			exports: 'ngCookies',
			deps: ['angular']
		},
		'trumbowyg-ng': {
			exports: 'trumbowyg-ng',
			deps: ['angular']
		},
		'libs/googlemaps': {
			exports: 'google'
		},
		// 'libs/datetimepicker': {
		// 	deps: ['libs/moment']
		// 	// exports: 'google'
		// }
	}
	, baseUrl: '/assets/js'

// kick start application
	, deps: ['./bootstrap']
});