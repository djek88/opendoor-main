/**
 *
 * Created by Vavooon on 17.12.2015.
 */

var titlePostfix = ' - OpenDoor';


var opendoorApp = angular.module('opendoorApp', [
	'ngRoute',
	'ngCookies',
	'opendoorControllers',
	'trumbowyg-ng'
]);

opendoorApp.directive('ngImageLoad', ['$parse', function ($parse) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs) {
			var fn = $parse(attrs.ngImageLoad);
			elem.on('load', function (event) {
				scope.$apply(function() {
					fn(scope, { $event: event });
				});
			});
		}
	};
}]);

opendoorApp.directive('ngLocation', function() {
	return {
		restrict: 'A',
		require: 'ngModel',

		link: function(scope, element, attr, ctrl) {
			var $element = $(element);
			var options = {
				autoDetect: !!attr.ngLocationAutodetect
			};
			if ($element.next().prop('tagName')=='INPUT') {
				options.locationField = $element.next();
			}
			$element.locationpicker(options);
			function customValidator(ngModelValue) {
				ctrl.$setValidity('valid', !!$element.val());
				return ngModelValue;
			}
			customValidator();
			ctrl.$parsers.push(customValidator);
			scope.$watch(attr['ngModel'], customValidator);
		}
	};
});


opendoorApp.run(['$rootScope', '$location', '$window', function($rootScope, $location, $window) {
	$rootScope.$religions = [
		'Christianity'
	,	'Islam'
	,	'Hinduism'
	,	'Chinese'
	,	'Buddism'
	,	'Taoism'
	,	'Shinto'
	,	'Sikhism'
	,	'Judaism'
	,	'Korean Shamanism'
	,	'Caodaism'
	,	'Bahá\'í Faith'
	,	'Jainism'
	,	'Cheondoism'
	,	'Hoahaoism'
	,	'Tenriism'
	];

	$rootScope.currentDate = new Date;

	$rootScope.$year = (new Date).getFullYear();

	$rootScope.siteconfig = siteconfig;

	$rootScope.$openPlace = function($event, $place) {
		$rootScope.$selectedPlace = $place;
		if ($event.which == 2) {
			$window.open('/places/' + $place.uri, '_blank');
		}
		else {
			$location.url('/places/' + $place.uri);
		}
	};


	$rootScope.submitForm = function() {
		this.form.$submitted = true;
		if (this.form.$valid) {
			document.forms.form.submit();
		}
	};

	$rootScope.$getMapInstance = function(targetEl) {
		if (!$rootScope.$map) {
			$div = $('<div id="map"></div>');
			$(targetEl).append($div);
			var map = $rootScope.$map = new google.maps.Map($div[0], {scrollwheel: false});
			map.markers=[];

			map.icons = {
				brightPoi: '/assets/img/spotlight-poi-bright.png'
				, defaultPoi: '/assets/img/spotlight-poi.png'
				, location: '/assets/img/mylocation.png'
			};

			map.removeMarkers=function(){
				var marker;
				while (marker = map.markers.pop()) {
					marker.setMap(null);
				}
			};

			map.addMarker=function(opts){
				opts.map = map;
				var marker = new google.maps.Marker(opts);
				map.markers.push(marker);
				return marker;
			}

			map.setMarker = function(location, bounds) {
				if (bounds) {
					map.fitBounds(bounds);
				}
				else {
					map.setZoom(16);
				}
				var pos = new google.maps.LatLng(location[0], location[1]);
				map.addMarker({
					position: pos
					,	map: map
					,	icon: map.icons.defaultPoi
				});
				map.setCenter(pos);
			}
		}
		else {
			$(targetEl).append($rootScope.$map.getDiv());
			$rootScope.$map.removeMarkers();
		}
		return $rootScope.$map;
	}
}]);

opendoorApp.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
}]);

opendoorApp.config( [
	'$compileProvider',
	function( $compileProvider )
	{
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|geo|tel):/);
	}
]);

opendoorApp.run(['$rootScope', '$route', '$cookies', '$location', function($rootScope, $route, $cookies, $location) {
	$rootScope.$on('$routeChangeSuccess', function() {
		document.title = $route.current.title + titlePostfix;
	});
	$rootScope.$on('$routeChangeStart', function ($event, $newRoute, $oldRoute) {
		if ($newRoute.$$route && $newRoute.$$route.shouldLogin && !$rootScope.$_id) {
			$location.url('/message?message=pleaselogin');
		}
	});

	var id = $cookies.get('_id');
	if (typeof id == 'string'){
		$rootScope.$_id = id.substring(3,id.length-1);
	}
	$rootScope.$email = $cookies.get('email');
	$rootScope.$isAdmin = $cookies.get('isAdmin') == 'true';
	$rootScope.$isLoggedIn = !!$rootScope.$email;
}]);

opendoorApp.config(
	function($locationProvider, $routeProvider) {
		$locationProvider.html5Mode(true);
		var $route = $routeProvider.$get[$routeProvider.$get.length-1]({$on:function(){}});
		$routeProvider.
		when('/', {
				title: 'Find nearest places'
			,	templateUrl: 'assets/templates/partials/search.html'
			, controller: 'SearchCtrl'
		}).
		when('/jobs/search', {
			title: 'Find a job'
			,	templateUrl: 'assets/templates/partials/jobsearch.html'
			, controller: 'JobSearchCtrl'
		}).
		when('/jobs/add', {
			title: 'Add job'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/jobform.html'
			, controller: 'JobFormCtrl'
		}).
		when('/jobs/edit/:id', {
			title: 'Edit job'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/jobform.html'
			, controller: 'JobFormCtrl'
		}).
		when('/jobs/fund/:id', {
			title: 'Fund job'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/jobfund.html'
			, controller: 'JobFundCtrl'
		}).
		when('/jobs/:id', {
			title: 'View job'
			,	templateUrl: 'assets/templates/partials/jobview.html'
			, controller: 'JobViewCtrl'
		}).
		when('/places/add', {
				title: 'Add place'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/placeform.html'
			, controller: 'PlaceFormCtrl'
		}).
		when('/places/edit/:id', {
			title: 'Edit place'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/placeform.html'
			, controller: 'PlaceFormCtrl'
		}).
		when('/places/claims', {
			title: 'Place claims'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/placeclaims.html'
			, controller: 'PlaceClaimsCtrl'
		}).
		when('/places/changes', {
			title: 'Suggested changes'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/placechanges.html'
			, controller: 'PlaceChangesCtrl'
		}).
		when('/places/list', {
			title: 'Places list'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/placeslist.html'
			, controller: 'PlacesListCtrl'
		}).
		when('/users/list', {
			title: 'Users list'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/userslist.html'
			, controller: 'UsersListCtrl'
		}).
		when('/users/:id', {
			title: 'View user'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/userview.html'
			, controller: 'UserViewCtrl'
		}).
		when('/promotion/:id', {
			title: 'View promotion'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/promotion.html'
			//, controller: 'PromotionCtrl'
		}).
		when('/places/last', {
			title: 'Last places'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/lastplaces.html'
			, controller: 'LastPlacesCtrl'
		}).
		when('/places/maintained', {
			title: 'Maintained places'
			,	shouldLogin: true
			,	templateUrl: 'assets/templates/partials/maintainedplaces.html'
			, controller: 'MaintainedPlacesCtrl'
		}).
		when('/places/donate/:id', {
			title: 'Donate'
			,	templateUrl: 'assets/templates/partials/donate.html'
			, controller: 'DonateCtrl'
		}).
		when('/places/review/:id', {
			title: 'Add review'
			,	templateUrl: 'assets/templates/partials/reviewadd.html'
			, controller: 'FormCtrl'
		}).
		when('/places/event/:id/add', {
			title: 'Add an event'
			,	templateUrl: 'assets/templates/partials/eventadd.html'
			, controller: 'EventAddCtrl'
		}).
		when('/places/editorproposal/:id', {
			title: 'Notify the person'
			,	templateUrl: 'assets/templates/partials/editorproposalform.html'
			, controller: 'EditorProposalCtrl'
		}).
		when('/places/:id', {
				title: 'View place'
			,	templateUrl: 'assets/templates/partials/placeview.html'
			, controller: 'PlaceViewCtrl'
		}).
		when('/subscribefornotification', {
			title: 'Subscribe fo notification'
			,	templateUrl: 'assets/templates/partials/subscribefornotification.html'
			, controller: 'SubscribeForNotificationFormCtrl'
		}).
		when('/login', {
				title: 'Login'
			,	templateUrl: 'assets/templates/partials/login.html'
			, controller: 'LoginCtrl'
		}).
		when('/register', {
				title: 'Register'
			,	templateUrl: 'assets/templates/partials/register.html'
			, controller: 'RegisterCtrl'
		}).
		when('/feedback', {
				title: 'Leave feedback'
			,	templateUrl: 'assets/templates/partials/feedback.html'
			, controller: 'FeedbackCtrl'
		}).
		when('/about', {
				title: 'About'
			,	templateUrl: 'assets/templates/partials/about.html'
		}).
		when('/error', {
				title: 'Error'
			,	templateUrl: 'assets/templates/partials/error.html'
			, controller: 'ErrorCtrl'
		}).
		when('/message', {
				title: 'Server message'
			,	templateUrl: 'assets/templates/partials/error.html'
			, controller: 'ErrorCtrl'
		}).
		when('/notfound', {
			title: 'Not found'
			,	templateUrl: 'assets/templates/partials/error.html'
			, controller: 'ErrorCtrl'
		}).
		otherwise({
			redirectTo: '/notfound'
		});
		$route.routes['/places/:id'].regexp = /^\/places\/(.*)$/;
	});