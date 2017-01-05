/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('SubscribeForNotificationFormCtrl', ['$scope', '$location',
		function ($scope, $location) {
			var query = $location.search();
			$scope.lat = query.lat;
			$scope.lng = query.lng
		}
	]);
});