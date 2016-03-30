/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';
	opendoorApp.registerController('LoginCtrl', ['$scope', '$location',
		function ($scope, $location) {
			switch ($location.search()['message']) {
				case 'regsuccess':
					$scope.alertType = 'success';
					$scope.alertMessage = 'Registration was successful. Please log in using your login and password';
					break;
				case 'wrongloginorpassword':
					$scope.alertType = 'danger';
					$scope.alertMessage = 'You have entered an invalid username or password';
					break;
			}
		}
	]);
});