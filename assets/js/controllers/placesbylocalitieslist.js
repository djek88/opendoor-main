define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';
	opendoorApp.registerController('PlacesByLocalitiesListCtrl', ['$scope', '$http', '$rootScope', '$location', '$window', '$routeParams',
		function ($scope, $http, $rootScope, $location, $window, $routeParams) {
			$scope.places = null;
			$scope.religionsList = $rootScope.religions;
			$scope.religion = '';
			$scope.country = paramToText($routeParams.country);
			$scope.locality = paramToText($routeParams.locality);

			var $table = $('#search-table');

			$scope.searchPlaces = function() {
				$scope.form.$submitted = true;
				setSearchParams();
			};

			$scope.setPage = function(n) {
				$scope.skip = (n - 1) * $scope.itemsPerPage;
				$scope.form.$submitted = true;
				setSearchParams();
			};

			var requestParams = $location.search();
			$scope.name = requestParams.name;
			$scope.skip = requestParams.skip;
			$scope.limit = requestParams.limit;
			$scope.religion = requestParams.religion;
			$scope.maintained = requestParams.maintained;
			requestParams.country = $scope.country;
			requestParams.locality = $scope.locality;
			$scope.message = 'Searching…';

			$http({
				url: '/ajax/places/search',
				method: 'GET',
				params: requestParams
			}).success(function (response) {
				if (typeof response !== 'object' || !Array.isArray(response.results)) {
					return onError();
				}

				var places = response.results;

				if (places.length) {
					for (var i = 0; i < places.length; i++) {
						if (places[i].updatedAt) {
							places[i].updatedAt = (new Date(places[i].updatedAt)).browserToUTC().toString(siteconfig.l10n.dateTimeFormat);
						}
					}

					$scope.message = '';
				} else {
					$scope.message = 'There are no places of worship';
				}

				$scope.places = places;
				$scope.count = response.count;
				$rootScope.getPages($scope);
			}).error(onError);

			function setSearchParams() {
				$location.search('name', $scope.name || null);
				$location.search('skip', $scope.skip || null);
				$location.search('limit', $scope.limit || null);
				$location.search('religion', $scope.religion || null);
				$location.search('maintained', $scope.maintained || null);
			}

			function onError() {
				$scope.message = 'An error happened during request';
				$scope.places = null;
			}

			function paramToText(param) {
				param = param.charAt(0).toUpperCase() + param.slice(1);
				return param.replace(/-/g, ' ');
			}
		}
	]);
});