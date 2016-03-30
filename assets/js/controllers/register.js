/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';
	opendoorApp.registerController('RegisterCtrl', ['$scope', '$location',
		function ($scope, $location) {
			switch ($location.search()['message']) {
				case 'alreadyregistered':
					$scope.alertType = 'danger';
					$scope.alertMessage = 'Your email already exists in our database. Please try to restore your password';
					break;
			}
		}
	]);
});