/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('LastPlacesCtrl', ['$scope', '$http',
		function ($scope, $http) {
			$scope.places = [];

			$scope.message = 'Loading…';
			$http({
				url: '/ajax/places/last'
				, method: 'GET'
			}).success(function (data) {
				if (Array.isArray(data)) {
					if (data.length) {
						for (var i = 0; i < data.length; i++) {
							data[i].distance = Math.round(data[i].distance);
						}
						$scope.message = '';
					}
					else {
						$scope.message = 'There are no places';
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