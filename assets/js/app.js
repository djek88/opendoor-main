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
	$rootScope.$denominations = [
			'Christian'
		,	'Judaism'
		,	'Taoism'
		,	'Islam'
	]
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
		when('/notfound', {
			templateUrl: 'assets/templates/partials/error.html'
			, controller: 'ErrorCtrl'
		}).
		otherwise({
			redirectTo: '/notfound'
		});
	});