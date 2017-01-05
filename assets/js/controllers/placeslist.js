/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('PlacesListCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
		function ($scope, $http, $rootScope, $location, $window) {

			$scope.places = null;
			var $table = $('#search-table');
			$scope.religionsList = $rootScope.religions;
			$scope.religion = '';
			
			var splittedUrl = $location.path().split('/');
			
			function toUp(string)
			{
				var firstChar = string.substring( 0, 1 ); // == "c"
				firstChar = firstChar.toUpperCase();
				var tail = string.substring( 1 ); // == "heeseburger"
				string = firstChar + tail;
				return string;
			}
			
			$scope.place = toUp(splittedUrl[splittedUrl.length - 2]);
			$scope.country = toUp(splittedUrl[splittedUrl.length - 3]);

			function setSearchParams() {

				var requestParams = {
					name: $scope.name
					, skip: $scope.skip
					, limit: $scope.limit
					, religion: $scope.religion
					, maintained: $scope.maintained
					, isConfirmed: $scope.isConfirmed
				};

				$location.search('name', requestParams.name || null);
				$location.search('skip', requestParams.skip || null);
				$location.search('limit', requestParams.limit || null);
				$location.search('religion', requestParams.religion || null);
				$location.search('maintained', requestParams.maintained || null);
				$location.search('isConfirmed', requestParams.isConfirmed || null);
			}

			$scope.searchPlaces = function () {
				$scope.form.$submitted = true;
				setSearchParams();
			};

			$scope.setPage = function (n) {
				$scope.skip = (n - 1) * $scope.itemsPerPage;
				$scope.form.$submitted = true;
				setSearchParams();
			};


			function onError() {
				$scope.message = 'An error happened during request';
				$scope.places = null;
			}


			var requestParams = $location.search();
			$scope.name = requestParams.name;
			$scope.skip = requestParams.skip;
			$scope.limit = requestParams.limit;
			$scope.religion = requestParams.religion;
			$scope.maintained = requestParams.maintained;
			$scope.isConfirmed = requestParams.isConfirmed;
			$scope.message = 'Searching…';
			$http({
				url: '/ajax/places/search'
				, method: 'GET'
				, params: requestParams
			}).success(function (response) {
				if (typeof response == 'object' && Array.isArray(response.results)) {
					var places = response.results;
					if (places.length) {
						for (var i = 0; i < places.length; i++) {
							if (places[i].updatedAt) {
								places[i].updatedAt = (new Date(places[i].updatedAt)).browserToUTC().toString(siteconfig.l10n.dateTimeFormat);
							}
						}
						$scope.message = '';
					}
					else {
						$scope.message = 'There are no places of worship';
					}
					$scope.places = places;
					$scope.count = response.count;
					$rootScope.getPages($scope);
				}
				else {
					onError();
				}
			}).error(onError);
		}

	]);
});