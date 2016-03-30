/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('UsersListCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
		function ($scope, $http, $rootScope, $location, $window) {

			$scope.users = null;

			$scope.openUser = function ($event, user) {
				//$rootScope.selectedUser = user;
				if ($event.which == 2) {
					$window.open('/users/' + user._id, '_blank');
				}
				else {
					$location.url('/users/' + user._id);
				}
			};

			$scope.setPage = function (n) {
				$scope.skip = (n - 1) * $scope.itemsPerPage;
				$scope.form.$submitted = true;
				setSearchParams();
			};

			function setSearchParams() {

				var requestParams = {
					maintainers: $scope.maintainers
					, name: $scope.name
					, email: $scope.email
					, skip: $scope.skip
					, limit: $scope.limit
				};

				$location.search('skip', requestParams.skip || null);
				$location.search('limit', requestParams.limit || null);
				$location.search('name', requestParams.name || null);
				$location.search('email', requestParams.email || null);
				$location.search('maintainers', requestParams.maintainers || null);
			}

			$scope.searchUsers = function () {
				$scope.form.$submitted = true;
				setSearchParams();
			};

			function onError() {
				$scope.message = 'An error happened during request';
				$scope.users = null;
			}

			var requestParams = $location.search();
			$scope.skip = requestParams.skip;
			$scope.limit = requestParams.limit;
			$scope.name = requestParams.name;
			$scope.email = requestParams.email;
			$scope.maintainers = requestParams.maintainers;
			$scope.message = 'Searching…';
			$http({
				url: '/ajax/users'
				, method: 'GET'
				, params: requestParams
			}).success(function (response) {
				if (typeof response == 'object' && Array.isArray(response.results)) {
					var data = response.results;
					if (data.length) {
						$scope.message = '';
					}
					else {
						$scope.message = 'There are no users';
					}
					$scope.users = data;
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