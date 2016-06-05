/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app', 'libs/stripe'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('DonateCtrl', ['$scope', '$location', '$rootScope', '$http',
		function ($scope, $location, $rootScope, $http) {
			$scope.months = 12;
			$scope.submitForm = function () {
				$scope.form.$submitted = true;
				if ($scope.form.$valid) {
					handler.open({
						name: siteconfig.sitename
						, description: 'Donate'
						, amount: $scope.months * 1000
					});
				}
			};


			var handler = StripeCheckout.configure({
				key: siteconfig.apiKeys.stripePublic
				//image: '/img/documentation/checkout/marketplace.png',
				, locale: 'auto'
				//, token: document.forms.form.submit
				, token: function (token) {
					document.forms.form.elements.token.value = token.id;
					document.forms.form.submit();

					// Use the token to create the charge with a server-side script.
					// You can access the token ID with `token.id`
				}
			});

			$scope.$on("$destroy", function () {
				handler.close();
			});


			var placeId = $location.path().split('/').pop();
			$scope.placeId = placeId;


			function setData($place) {

				$scope.place = $place;
			}

			if ($rootScope.selectedPlace) {
				setData($rootScope.selectedPlace);
			}
			else {
				$http({
					url: '/ajax/places/' + placeId
					, method: 'GET'
				}).success(function (data) {
					if (typeof data == 'object') {
						setData(data);
					}
					else {
						$location.url('/notfound');
					}
				}).error(function () {
					$location.url('/notfound');
				});
			}

		}
	]);
});