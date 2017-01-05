/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';
	opendoorApp.registerController('LocalitiesListCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
		function ($scope, $http, $rootScope, $location, $window) {

			var splittedUrl = $location.path().split('/');
			$scope.country = splittedUrl[splittedUrl.length - 2];
			$scope.religionsList = $rootScope.religions;
			$scope.religion = '';


			function setSearchParams() {

				var requestParams = {
					name: $scope.name
					//, skip: $scope.skip
					//, limit: $scope.limit
					, religion: $scope.religion
					, maintained: $scope.maintained
				};

				$location.search('name', requestParams.name || null);
				//$location.search('skip', requestParams.skip || null);
				//$location.search('limit', requestParams.limit || null);
				$location.search('religion', requestParams.religion || null);
				$location.search('maintained', requestParams.maintained || null);
			}

			$scope.searchPlaces = function () {
				console.log($scope.skip);
				$scope.form.$submitted = true;
				setSearchParams();
			};
			//
			//$scope.setPage = function(n) {
			//	$scope.skip = (n-1) * $scope.itemsPerPage;
			//	$scope.form.$submitted = true;
			//	setSearchParams();
			//};


			function onError() {
				$scope.message = 'An error happened during request';
				$scope.places = null;
			}

			$scope.openLocality = function ($event, country) {
				//$rootScope.selectedPlace = place;
				if ($event.which == 2) {
					$window.open('/places/' + $scope.getLink(country), '_blank');
				}
				else {
					$location.url('/places/' + $scope.getLink(country));
				}
			};

			$scope.getLink = function (locality) {
				return $scope.country.toLowerCase() + '/' + locality.replace(/ /g, '-').toLowerCase();
			}

			var requestParams = $location.search();
			$scope.name = requestParams.name;
			//$scope.skip = requestParams.skip;
			//$scope.limit = requestParams.limit;
			$scope.religion = requestParams.religion;
			$scope.maintained = requestParams.maintained;
			$scope.message = 'Searching…';
			$http({
				url: '/ajax/localities?country=' + $scope.country
				, method: 'GET'
				, params: requestParams
			}).success(function (response) {
				if (typeof response == 'object' && Array.isArray(response)) {
					var localities = response;
					if (localities.length) {
						$scope.message = '';
					}
					else {
						$scope.message = 'There are no places';
					}
					$scope.localities = localities;
					$scope.count = response.count;
				}
				else {
					onError();
				}
			}).error(onError);
		}

	]);
});