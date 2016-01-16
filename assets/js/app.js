/**
 *
 * Created by Vavooon on 17.12.2015.
 */

var titlePostfix = ' - OpenDoor';


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
			function customValidator(ngModelValue) {
				ctrl.$setValidity('valid', !!$element.val());
				return ngModelValue;
			}
			customValidator();
			ctrl.$parsers.push(customValidator);
			scope.$watch(attr['ngModel'], customValidator);
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

	$rootScope.getTime = function(date) {
		var formattedTime = '';
		if (date.getHours() < 10) {
			formattedTime += '0';
		}
		formattedTime += date.getHours();
		formattedTime += ':';

		if (date.getMinutes() < 10) {
			formattedTime += '0';
		}
		formattedTime += date.getMinutes();
		return formattedTime;
	};


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
			};

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


opendoorApp.run(['$rootScope', '$route', function($rootScope, $route) {
	$rootScope.$on('$routeChangeSuccess', function() {
		document.title = $route.current.title + titlePostfix;
	});
}]);

opendoorApp.config(
	function($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(true);
		$routeProvider.
		when('/', {
				title: 'Find nearest places'
			,	templateUrl: 'assets/templates/partials/search.html'
			, controller: 'SearchCtrl'
		}).
		when('/places/add', {
				title: 'Add place'
			,	templateUrl: 'assets/templates/partials/placeform.html'
			, controller: 'PlaceFormCtrl'
		}).
		when('/places/edit/:id', {
				title: 'Edit place'
			,	templateUrl: 'assets/templates/partials/placeform.html'
			, controller: 'PlaceFormCtrl'
		}).
		when('/places/:id', {
				title: 'View place'
			,	templateUrl: 'assets/templates/partials/placeview.html'
			, controller: 'PlaceViewCtrl'
		}).
		when('/places/review/:id', {
				title: 'Add review'
			,	templateUrl: 'assets/templates/partials/reviewadd.html'
			, controller: 'ReviewAddCtrl'
		}).
		when('/login', {
				title: 'Login'
			,	templateUrl: 'assets/templates/partials/login.html'
			, controller: 'LoginCtrl'
		}).
		when('/register', {
				title: 'Register'
			,	templateUrl: 'assets/templates/partials/register.html'
			, controller: 'RegisterCtrl'
		}).
		when('/feedback', {
				title: 'Leave feedback'
			,	templateUrl: 'assets/templates/partials/feedback.html'
			, controller: 'FeedbackCtrl'
		}).
		when('/about', {
				title: 'About'
			,	templateUrl: 'assets/templates/partials/about.html'
			//, controller: 'FeedbackCtrl'
		}).
		when('/error', {
				title: 'Error'
			,	templateUrl: 'assets/templates/partials/error.html'
			, controller: 'ErrorCtrl'
		}).
		when('/message', {
				title: 'Server message'
			,	templateUrl: 'assets/templates/partials/error.html'
			, controller: 'ErrorCtrl'
		}).
		when('/notfound', {
			title: 'Not found'
			,	templateUrl: 'assets/templates/partials/error.html'
			, controller: 'ErrorCtrl'
		}).
		otherwise({
			redirectTo: '/notfound'
		});
	});