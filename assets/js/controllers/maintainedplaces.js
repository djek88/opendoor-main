/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('MaintainedPlacesCtrl', ['$scope', '$http',
		function ($scope, $http) {
			$scope.places = [];
			$scope.message = 'Loading…';
			$http({
				url: '/ajax/places/maintained'
				, method: 'GET'
			}).success(function (data) {
				if (Array.isArray(data)) {
					if (data.length) {
						$scope.message = '';
					}
					else {
						$scope.message = 'There are no maintained places';
					}
					$scope.places = data;
				}
				else {
					$scope.message = 'An error happened during request';
					$scope.places = [];
				}
			}).error(function () {
				$scope.message = 'Error processing request';
			});
		}


	]);
});