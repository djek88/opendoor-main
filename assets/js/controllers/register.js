define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';
	opendoorApp.registerController('RegisterCtrl', ['$scope', '$location',
		function ($scope, $location) {
			var messageParam = $location.search()['message'];

			if (messageParam === 'alreadyregistered') {
				$scope.alertType = 'danger';
				$scope.alertMessage = 'Your email already exists in our database. Please try to restore your password';
			}
		}
	]);
});