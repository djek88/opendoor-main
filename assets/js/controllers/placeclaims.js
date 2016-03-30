/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('PlaceClaimsCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
		function ($scope, $http, $rootScope, $location, $window) {

			$scope.message = 'Loading…';
			$http({
				url: '/ajax/claims'
				, method: 'GET'
			}).success(function (data) {
				if (Array.isArray(data)) {
					if (data.length) {
						$scope.message = '';
					}
					else {
						$scope.message = 'There are no claims';
					}
					$scope.claims = data;
				}
				else {
					$scope.message = 'An error happened during request';
				}
			}).error(function () {
				$scope.message = 'Error processing request';
			});
		}

	]);
});