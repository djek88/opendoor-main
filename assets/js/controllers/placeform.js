define([
  'angular',
  'app',
  'libs/bootstrap',
  'libs/googlemaps',
  'libs/tagsinput',
  'libs/typeahead',
  'libs/datetimepicker',
  'libs/selectpicker',
  'libs/trumbowyg',
  'locationpicker'
], function(angular, opendoorApp) {
  opendoorApp.registerController('PlaceFormCtrl', ['$scope', '$rootScope', '$location', '$http', PlaceFormCtrl]);

  function PlaceFormCtrl($scope, $rootScope, $location, $http) {
    var placeId = $location.path().split('/').pop();
    var geocoder = new google.maps.Geocoder();
    var map;
    var denominations = [];
    var $denominationsEl = $('input[name="denominations"]');

    $('.input-group.date').datetimepicker({ format: siteconfig.l10n.timeFormat });
    $('.location-picker').locationpicker();
    $('.bootstrap-tagsinput').addClass('form-control');

    $scope.ADDNEWGROUP = 'Add new group...';
    $scope.religions = $rootScope.religions;
    $scope.religionGroups = [];
    $scope.isLogged = !!$rootScope._id;

    $scope.searchByAddress = searchByAddress;
    $scope.loadOptionsForReligion = loadOptionsForReligion;

    if (placeId === 'add') {
      placeId = 0;
    } else {
      $scope.submitPath = '/places/edit/' + placeId;
      $scope.additionalFieldsAreVisible = true;
    }

    $rootScope.getMapInstance($('#results-map'))
      .then(function(m) {
        var pos = new google.maps.LatLng(0, 0);
        map = m;

        google.maps.event.addListenerOnce(map, 'idle', function() {
          google.maps.event.trigger(map, 'resize');
        });

        map.setCenter(pos);
        map.setZoom(2);
      })
      .catch(console.log.bind(console));

    $denominationsEl.tagsinput({
      typeahead: {
        source: function() {
          var results = [];
          var currentTags = $denominationsEl.val().slice(',');

          Object.keys(denominations).forEach(function(key) {
            if (Object.prototype.hasOwnProperty.call(denominations, key)
              && currentTags.indexOf(denominations[key]) === -1) {
              results.push(denominations[key]);
            }
          });

          return results;
        }
      },
      freeInput: true,
      tagClass: 'label label-primary'
    });

    if (placeId) {
      $scope.edit = true;
      $scope.mode = 'edit';

      if ($rootScope.selectedPlace) {
        setData($rootScope.selectedPlace);
      } else {
        $http({
          url: '/ajax/places/' + placeId,
          method: 'GET'
        }).success(function(data) {
          if (typeof data === 'object') {
            setData(data);
          } else {
            $location.url('/notfound');
          }
        }).error(function() {
          $location.url('/notfound');
        });
      }
    } else {
      $scope.edit = false;
      $scope.mode = 'add';
      $scope.place = {
        address: {},
        location: {}
      };
    }

    function searchByAddress() {
      var concatenatedAddress = [
        $scope.place.address.line1,
        $scope.place.address.line2,
        $scope.place.address.locality,
        $scope.place.address.region,
        $scope.place.address.country,
        $scope.place.address.postalCode
      ].cleanArray().join(', ');

      geocoder.geocode({ address: concatenatedAddress }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          map.removeMarkers();

          if (results.length) {
            var firstResult = results[0];
            var $locationEl = $('[name="location"]');

            $locationEl.val([firstResult.geometry.location.lng(), firstResult.geometry.location.lat()].join(', '));
            $locationEl.trigger('change');
            map.setMarker(
              [firstResult.geometry.location.lng(), firstResult.geometry.location.lat()],
              firstResult.geometry.bounds
            );
          }
        }
      });
    }

    function setData(place) {
      $scope.place = place;
      $scope.isMaintainer = place.maintainer
        && place.maintainer._id && place.maintainer._id === $rootScope._id;

      loadOptionsForReligion(place.religion);
      $scope.place.groupName = place.groupName;
      $rootScope.getMapInstance($('#results-map')).then(function(m) {
        m.setMarker(place.location.coordinates);

        place.denominations.forEach(function(denomination) {
          $denominationsEl.tagsinput('add', denomination);
        });
      });
    }

    function loadOptionsForReligion(religion) {
      $http({
        url: '/ajax/religionGroups',
        method: 'GET',
        params: { religion: religion }
      }).success(function(groups) {
        groups.unshift({ name: $scope.ADDNEWGROUP });
        $scope.religionGroups = groups.map(function(group) { return group.name; });
      });

      $http({
        url: '/ajax/denominations',
        method: 'GET',
        params: { religion: religion }
      }).success(function(results) {
        denominations = results.map(function(item) {
          return item.name;
        });
      });
    }
  }
});
