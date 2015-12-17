/**
 *
 * Created by Vavooon on 17.12.2015.
 */
var opendoorApp = angular.module('opendoorApp', [
	'ngRoute',
	'opendoorControllers'
]);

opendoorApp.config(
	function($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(true);
		$routeProvider.
		when('/', {
			templateUrl: 'assets/templates/partials/index.html'
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
		when('/phones/:phoneId', {
			templateUrl: 'partials/phone-detail.html',
			//controller: 'PhoneDetailCtrl'
		}).
		otherwise({
			redirectTo: '/'
		});
	});