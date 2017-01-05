/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app', 'libs/stripe'], function (angular, opendoorApp) {
	'use strict';

	opendoorApp.registerController('JobFundCtrl', ['$scope', '$rootScope', '$location', '$http',
		function ($scope, $rootScope, $location, $http) {
			$scope.alertType = 'info';
			$scope.alertTitle = 'Success';
			$scope.alertMessage = 'Your job was added successfully. Please pay $1 to publish the job on the Opportunities page.';

			$scope.submitForm = function () {
				$scope.form.$submitted = true;
				if ($scope.form.$valid) {
					handler.open({
						name: siteconfig.sitename
						, description: 'Payment for job posting'
						, amount: 100
					});
				}
			};


			var handler = StripeCheckout.configure({
				key: siteconfig.apiKeys.stripePublic
				, locale: 'auto'
				, token: function (token) {
					document.forms.form.elements.token.value = token.id;
					document.forms.form.submit();
				}
			});

			$scope.$on("$destroy", function () {
				handler.close();
			});


		}
	]);
});