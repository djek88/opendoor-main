/**
 * Created by vavooon on 29.03.16.
 */
define(['angular', 'app'], function (angular, opendoorApp) {
	'use strict';



	opendoorApp.registerController('ErrorCtrl', ['$scope', '$location',
		function ($scope, $location) {
			var search = $location.search();
			var message;
			if ($location.path() == '/notfound') {
				message = 'notfound';
			}
			else if (!$location.path().indexOf('/promotion/')) {
				message = 'donation';
			}
			else {
				message = search.message;
			}
			switch (message) {
				case 'donation':
					$scope.alertType = 'default';
					$scope.alertTitle = 'Donation was successful';
					$scope.alertMessage = 'Thank you for your donation.';
					break;
				case 'pleaselogin':
					$scope.alertType = 'danger';
					$scope.alertTitle = 'Error';
					$scope.alertMessage = 'Please login first';
					$scope.backTitle = 'Login';
					break;
				case 'alreadyregistered':
					$scope.alertType = 'danger';
					$scope.alertTitle = 'Error';
					$scope.alertMessage = 'Your email already exists in our database. Please try to restore your password';
					break;
				case 'notfound':
					$scope.alertType = 'danger';
					$scope.alertTitle = 'Error';
					$scope.alertMessage = 'Page not found';
					break;
				case 'proposalsent':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Your proposal has been sent';
					break;
				case 'messagesent':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Your message has been sent to the place of worship';
					break;
				case 'feedbacksaved':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Your message has been received';
					$scope.alertMessage = 'Thank you for taking the time to send us feedback. We will reply to you as soon as we can and normally within 24 hours.';
					break;
				case 'notificationsaved':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Your subscription has been saved';
					$scope.alertMessage = 'We will notify you when place near you will be added';
					break;
				case 'changesadded':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Your changes has been added';
					$scope.alertMessage = 'Please wait until place maintainer accept your changes.';
					break;
				case 'claimadded':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Your claim has been added';
					$scope.alertMessage = 'Please wait until administrator accept your claim.';
					break;
				case 'changeaccepted':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Change has been accepted';
					break;
				case 'changedenied':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Change has been denied';
					break;
				case 'claimaccepted':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Claim has been accepted';
					break;
				case 'claimdenied':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Claim has been denied';
					break;
				case 'reviewsaved':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Your review has been saved';
					$scope.alertMessage = 'Thank you for taking the time to place a review.';
					break;

				case 'sitemapgenerated':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Sitemap was successfully generated';
					break;
				case 'eventadded':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Your event has been added';
					break;
				case 'eventsaved':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Your event has been saved';
					break;
				case 'placeadded':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Place was added successfully. Confirmation link was sent to your mail';
					break;
				case 'placesaved':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Place was saved successfully.';
					break;
				case 'placeconfirmed':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Place was confirmed successfully';
					break;
				case 'placeconfirmationerror':
					$scope.alertType = 'danger';
					$scope.alertTitle = 'Error';
					$scope.alertMessage = 'Error during place confirmation';
					break;
				case 'placeaddederror':
					$scope.alertType = 'danger';
					$scope.alertTitle = 'Error';
					$scope.alertMessage = 'Error during saving place';
					break;
				case 'subscriptionadded':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Subscription was added successfully';
					break;
				case 'verifysubscription':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'We\'ve sent confirmation details on your email';
					break;
				case 'subscriptionexists':
					$scope.alertType = 'danger';
					$scope.alertTitle = 'Error';
					$scope.alertMessage = 'You are already subscribed on this place';
					break;
				case 'subscriptionconfirmed':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Subscription was confirmed successfully';
					break;
				case 'subscriptionconfirmationerror':
					$scope.alertType = 'danger';
					$scope.alertTitle = 'Error';
					$scope.alertMessage = 'Error during subscription confirmation';
					break;
				case 'jobfunded':
					$scope.alertType = 'info';
					$scope.alertTitle = 'Success';
					$scope.alertMessage = 'Your job was successfully published';
					$scope.backTitle = 'View job';
					break;
				default:
					$scope.alertType = 'danger';
					$scope.alertTitle = 'Error';
					$scope.alertMessage = 'An unexpected error happened';
					break;
			}
			$scope.back = search.back;
		}
	]);
});