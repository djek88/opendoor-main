/**
 *
 * Created by Vavooon on 17.12.2015.
 */
var opendoorApp = angular.module('opendoorApp', [
	'ngRoute',
	'ngCookies',
	'opendoorControllers'
]);

opendoorApp.directive('ngLocation', function() {
	return {
		restrict: 'A',
		require: 'ngModel',

		link: function(scope, element, attr, ctrl) {
			var $element = $(element);
			var options = {
				autoDetect: !!attr.ngLocationAutodetect
			};
			if ($element.next().prop('tagName')=='INPUT') {
				options.locationField = $element.next();
			}
			$element.locationpicker(options);

			ctrl.$setValidity('valid', false);

			function customValidator(ngModelValue) {
				ctrl.$setValidity('valid', !!$element.val());
				return ngModelValue;
			}
			ctrl.$parsers.push(customValidator);

		}
	};
});


opendoorApp.run(function($rootScope) {
	$rootScope.$religions = [
		'Christianity'
	,	'Islam'
	,	'Hinduism'
	,	'Chinese'
	,	'Buddism'
	,	'Taoism'
	,	'Shinto'
	,	'Sikhism'
	,	'Judaism'
	,	'Korean Shamanism'
	,	'Caodaism'
	,	'Bahá\'í Faith'
	,	'Jainism'
	,	'Cheondoism'
	,	'Hoahaoism'
	,	'Tenriism'
	];

	$rootScope.$getMapInstance = function(targetEl) {
		if (!$rootScope.$map) {
			$div = $('<div id="map"></div>');
			$(targetEl).append($div);
			var map = $rootScope.$map = new google.maps.Map($div[0], {});
			map.markers=[];

			map.removeMarkers=function(){
				var marker;
				while (marker = map.markers.pop()) {
					marker.setMap(null);
				}
			}

			map.addMarker=function(opts){
				opts.map = map;
				var marker = new google.maps.Marker(opts);
				map.markers.push(marker);
				return marker;
			}
		}
		else {
			$(targetEl).append($rootScope.$map.getDiv());
			$rootScope.$map.removeMarkers();
		}
		return $rootScope.$map;
	}
});

opendoorApp.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

opendoorApp.config(
	function($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(true);
		$routeProvider.
		when('/', {
			templateUrl: 'assets/templates/partials/search.html'
			, controller: 'SearchCtrl'
		}).
		when('/places/add', {
			templateUrl: 'assets/templates/partials/placeadd.html'
			, controller: 'PlaceAddCtrl'
		}).
		when('/places/:id', {
			templateUrl: 'assets/templates/partials/placeview.html'
			, controller: 'PlaceViewCtrl'
		}).
		when('/places/review/:id', {
			templateUrl: 'assets/templates/partials/reviewadd.html'
			, controller: 'ReviewAddCtrl'
		}).
		when('/login', {
			templateUrl: 'assets/templates/partials/login.html'
			, controller: 'LoginCtrl'
		}).
		when('/register', {
				templateUrl: 'assets/templates/partials/register.html'
			, controller: 'RegisterCtrl'
		}).
		when('/error', {
				templateUrl: 'assets/templates/partials/error.html'
			, controller: 'ErrorCtrl'
		}).
		when('/message', {
			templateUrl: 'assets/templates/partials/error.html'
			, controller: 'ErrorCtrl'
		}).
		when('/feedback', {
			templateUrl: 'assets/templates/partials/feedback.html'
			, controller: 'FeedbackCtrl'
		}).
		when('/about', {
			templateUrl: 'assets/templates/partials/about.html'
			//, controller: 'FeedbackCtrl'
		}).
		when('/notfound', {
			templateUrl: 'assets/templates/partials/error.html'
			, controller: 'ErrorCtrl'
		}).
		otherwise({
			redirectTo: '/notfound'
		});
	});