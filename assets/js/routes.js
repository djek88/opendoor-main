define(['./app'], function (opendoorApp) {
	'use strict';

	return opendoorApp.config(function ($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(true);
		//var $route = $routeProvider.$get[$routeProvider.$get.length-1]({$on:function(){}});

		$routeProvider
			.when('/', {
				title: 'Search for local Place of Worship',
				meta: 'Find your Place of Worship anywhere in the World. Check to make sure your Place of Worship is listed and correct so others can find it.',
				templateUrl: 'assets/templates/partials/search.html',
				controller: 'SearchCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/search.js')
			})
			.when('/register', {
				title: 'Register your account at Open Door',
				meta: 'Update your local Place of Worship details so that the details are correct and let others find it.',
				templateUrl: 'assets/templates/partials/register.html',
				controller: 'RegisterCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/register.js')
			})
			.when('/login', {
				title: 'Login to Open Door',
				meta: 'Log into your Open Door account so you can keep your Place of Worship up to date. Add events and post jobs',
				templateUrl: 'assets/templates/partials/login.html',
				controller: 'LoginCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/login.js')
			})

			.when('/users/list', {
				title: 'Users list',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/userslist.html',
				controller: 'UsersListCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/userslist.js')
			})
			.when('/users/:id', {
				title: 'View user',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/userview.html',
				controller: 'UserViewCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/userview.js')
			})

			.when('/places/add', {
				title: 'Add a Place of Worship',
				meta: 'Add your Place of Worship for free, list events, get reviews and allow others to find it.',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/placeform.html',
				controller: 'PlaceFormCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/placeform.js')
			})
			.when('/places/edit/:id', {
				title: 'Edit place',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/placeform.html',
				controller: 'PlaceFormCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/placeform.js')
			})
			.when('/places/claims', {
				title: 'Places of Worship you claimed',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/placeclaims.html',
				controller: 'PlaceClaimsCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/placeclaims.js')
			})
			.when('/places/changes', {
				title: 'Suggested changes to Place of Worship',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/placechanges.html',
				controller: 'PlaceChangesCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/placechanges.js')
			})
			.when('/places/list', {
				title: 'Places list',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/placeslist.html',
				controller: 'PlacesListCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/placeslist.js')
			})
			.when('/places/', {
				title: 'Places of Worship listed by Country',
				meta: 'Find your Place of Worship anywhere in the World. A list of all Places of Worship by Country. Check to make sure your Place of Worship is listed and correct so others can find it.',
				templateUrl: 'assets/templates/partials/countrieslist.html',
				controller: 'CountriesListCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/countrieslist.js')
			})
			.when('/places/last', {
				title: 'Last places',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/lastplaces.html',
				controller: 'LastPlacesCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/lastplaces.js')
			})
			.when('/places/maintained', {
				title: 'Places of Worship you maintain',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/maintainedplaces.html',
				controller: 'MaintainedPlacesCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/maintainedplaces.js')
			})
			.when('/places/donate/:id', {
				title: 'Donate',
				templateUrl: 'assets/templates/partials/donate.html',
				controller: 'DonateCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/donate.js')
			})
			.when('/places/review/:id', {
				title: 'Add review',
				templateUrl: 'assets/templates/partials/reviewadd.html',
				// controller: 'FormCtrl'
			})
			.when('/places/editorproposal/:id', {
				title: 'Notify the person',
				templateUrl: 'assets/templates/partials/editorproposalform.html',
				controller: 'EditorProposalCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/editorproposal.js')
			})
			.when('/places/:country/', {
				title: 'Localities list',
				templateUrl: 'assets/templates/partials/localitieslist.html',
				controller: 'LocalitiesListCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/localitieslist.js')
			})
			.when('/places/:country/:locality/', {
				title: 'Places list',
				templateUrl: 'assets/templates/partials/placesbylocalitieslist.html',
				controller: 'PlacesByLocalitiesListCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/placesbylocalitieslist.js')
			})
			.when('/places/:country/:region/:locality/:religion/:groupName/:name', {
				title: 'View place',
				templateUrl: 'assets/templates/partials/placeview.html',
				controller: 'PlaceViewCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/placeview.js')
			})
			.when('/places/:id', {
				title: 'View place',
				templateUrl: 'assets/templates/partials/placeview.html',
				controller: 'PlaceViewCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/placeview.js')
			})

			.when('/jobs/add', {
				title: 'Add job',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/jobform.html',
				controller: 'JobFormCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/jobform.js')
			})
			.when('/jobs/edit/:id', {
				title: 'Edit job',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/jobform.html',
				controller: 'JobFormCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/jobform.js')
			})
			.when('/jobs/fund/:id', {
				title: 'Fund job',
				shouldLogin: true,
				templateUrl: 'assets/templates/partials/jobfund.html',
				controller: 'JobFundCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/jobfund.js')
			})
			.when('/jobs/:id', {
				title: 'View job',
				templateUrl: 'assets/templates/partials/jobview.html',
				controller: 'JobViewCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/jobview.js')
			})
			
			.when('/events/search', {
				title: 'Search for events at Places of Worship',
				// meta: 'Find your ideal job anywhere in the World. Jobs listed associated with running a Place of Worship',
				templateUrl: 'assets/templates/partials/eventsearch.html',
				controller: 'EventSearchCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/eventsearch.js')
			})
			.when('/events/add', {
				title: 'Add an event',
				templateUrl: 'assets/templates/partials/eventform.html',
				controller: 'EventFormCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/eventform.js')
			})
			.when('/events/:id/edit', {
				title: 'Edit event',
				templateUrl: 'assets/templates/partials/eventform.html',
				controller: 'EventFormCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/eventform.js')
			})

			.when('/subscribefornotification', {
				title: 'Subscribe fo notification',
				templateUrl: 'assets/templates/partials/subscribefornotification.html',
				controller: 'SubscribeForNotificationFormCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/subscribefornotificationform.js')
			})
			.when('/feedback', {
				title: 'Leave feedback',
				templateUrl: 'assets/templates/partials/feedback.html',
				controller: 'FeedbackCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/feedback.js')
			})
			.when('/about', {
				title: 'About the Open Door Project',
				meta: 'The biggest resource for finding a Place of Worship. The Open Door Project needs your help',
				templateUrl: 'assets/templates/partials/about.html'
			})
			.when('/error', {
				title: 'Error',
				templateUrl: 'assets/templates/partials/error.html',
				controller: 'ErrorCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/error.js')
			})
			.when('/tools', {
				title: 'Tools',
				templateUrl: 'assets/templates/partials/tools.html'
			})
			.when('/message', {
				title: 'Server message',
				templateUrl: 'assets/templates/partials/error.html',
				controller: 'ErrorCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/error.js')
			})
			.when('/promotion/:id', {
				title: 'View promotion',
				templateUrl: 'assets/templates/partials/error.html',
				controller: 'ErrorCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/error.js')
			})
			.when('/notfound', {
				title: 'Not found',
				templateUrl: 'assets/templates/partials/error.html',
				controller: 'ErrorCtrl',
				resolve: opendoorApp.resolveController('/assets/js/controllers/error.js')
			})
			.otherwise({
				redirectTo: '/notfound'
			});

		//$route.routes['/places/:id'].regexp = /^\/places\/(.*)$/;
	});
});