/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('JobSearchCtrl', ['$scope', '$http', '$rootScope', '$location', '$window',
		function ($scope, $http, $rootScope, $location, $window) {

			var $religionEl = $('select[name="religion"]');
			$scope.jobs = null;
			$scope.message = '';
			$scope.religionsList = $rootScope.religions;
			var hiddenGroupName;

			$scope.openJob = function ($event, job) {
				if ($event.which == 2) {
					$window.open('/jobs/' + job._id, '_blank');
				}
				else {
					$location.url('/jobs/' + job._id);
				}
			};

			function loadOptionsForReligion(religion) {
				console.log(religion);
				if (!religion || religion == 'All religions') {
					$scope.groupsList = ['Select religion'];
					$scope.groupName = $scope.groupsList[0];
				}
				else {
					$http({
						url: '/ajax/religionGroups'
						, method: 'GET'
						, params: {
							religion: religion
						}
					}).success(function (data) {
						$scope.groupsList = ['All groups'];

						for (var i = 0; i < data.length; i++) {
							$scope.groupsList.push(data[i].name);
						}

						$scope.groupName = $scope.groupsList.indexOf(hiddenGroupName) != -1 ? hiddenGroupName : $scope.groupsList[0];
					});
				}
			}

			$http({
				url: '/ajax/countries'
				, method: 'GET'
			}).success(function (data) {
				$scope.countriesList = ['All countries'];

				$scope.countriesList = $scope.countriesList.concat(data);
				$scope.country = $scope.country || $scope.countriesList[0];
			});


			$religionEl.on('change', function () {
				loadOptionsForReligion($religionEl.val());
			});

			function setSearchParams() {

				var requestParams = {
					country: $scope.country == 'All countries' ? null : $scope.country
					,
					locality: $scope.locality == 'Select country' || $scope.locality == 'All cities' ? null : $scope.locality
					,
					religion: $scope.religion == 'All religions' ? null : $scope.religion
					,
					groupName: $scope.groupName == 'Select religion' || $scope.groupName == 'All groups' ? null : $scope.groupName
				};
				$location.search('country', requestParams.country || null);
				$location.search('locality', requestParams.locality || null);
				$location.search('religion', requestParams.religion || null);
				$location.search('groupName', requestParams.groupName || null);
			}

			$scope.searchJobs = function () {
				setSearchParams();
			};

			function onError() {
				$scope.message = 'An error happened during request';
				$scope.jobs = null;
			}

			var requestParams = $location.search();
			$scope.country = requestParams.country;
			$scope.locality = requestParams.locality;
			$scope.religion = requestParams.religion;
			$scope.groupName = requestParams.groupName;
			console.log(requestParams);
			hiddenGroupName = $scope.groupName;
			loadOptionsForReligion($scope.religion);
			$scope.message = 'Searching…';
			$http({
				url: '/ajax/jobs/search'
				, method: 'GET'
				, params: requestParams
			}).success(function (data) {
				if (Array.isArray(data)) {
					if (data.length) {
						$scope.message = '';
					}
					else {
						$scope.message = 'There are no jobs found';
					}
					$scope.jobs = data;
				}
				else {
					onError();
				}
			}).error(onError);

		}
	]);

});