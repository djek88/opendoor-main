/**
 *
 * Created by Vavooon on 17.12.2015.
 */
var opendoorApp = angular.module('opendoorApp', [
	'ngRoute',
	'ngCookies',
	'opendoorControllers'
]);

opendoorApp.config(
	function($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(true);
		$routeProvider.
		when('/', {
			templateUrl: 'assets/templates/partials/search.html'
			, controller: 'SearchCtrl'
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
		when('/notfound', {
			templateUrl: 'assets/templates/partials/error.html'
			, controller: 'ErrorCtrl'
		}).
		otherwise({
			redirectTo: '/notfound'
		});
	});