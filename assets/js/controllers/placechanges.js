/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('PlaceChangesCtrl', ['$scope', '$http', '$rootScope', '$location', '$window', '$sce',
		function ($scope, $http, $rootScope, $location, $window, $sce) {

			$scope.message = 'Loading…';
			$http({
				url: '/ajax/placechanges'
				, method: 'GET'
			}).success(function (data) {
				if (Array.isArray(data)) {
					if (data.length) {
						for (var i = 0; i < data.length; i++) {
							var change = data[i];
							if (Array.isArray(change.value)) {
								change.value = change.value.join(', ');
							}
							else if (change.field == 'address') {
								change.value = [change.value.line1, change.value.line2, change.value.locality, change.value.region, change.value.country, change.value.postalCode].cleanArray().join(', ');
							}
							else if (change.field == 'location') {
								change.value = change.value.coordinates.join(', ');
							}
							else if (change.field == 'bannerPhoto' || change.field == 'leaderPhoto') {

								change.htmlValue = $sce.trustAsHtml('<img class="change-preview-photo" src="/photos/' + change.value + '">');
							}
						}
						$scope.message = '';
					}
					else {
						$scope.message = 'There are no suggested changes';
					}
					$scope.changes = data;
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