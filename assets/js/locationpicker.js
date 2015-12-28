/**
 * Created by Vavooon on 22.12.2015.
 */
$.fn.locationpicker = function(options) {
	var defaults = {
			autoDetect: false
		, locationField: null
	}
	options = $.extend({}, defaults, options);
	var geocoder = new google.maps.Geocoder();
	var $resultsEl = $('<div class="location-picker-results"></div>');
	var $rootEl = this.parent();
	var $inputEl = this;
	var $autoDetectEl = $('button', $rootEl);
	var location = null;


	// This hack makes coordinates available in form

	var $coordsEl = options.locationField;
	function showResults() {
		$rootEl.addClass('location-picker-active');
		var offset = $inputEl.offset();
		$resultsEl.css('top', offset.top + $inputEl.outerHeight());
		$resultsEl.css('left', offset.left);
		$resultsEl.css('width', $inputEl.parent().outerWidth());
		$(document.body).append($resultsEl);
	}

	function removeResults() {
		$rootEl.removeClass('location-picker-active');
		$resultsEl.remove();
	}

	function setLocation(newLocation) {
		if (newLocation && newLocation.geometry) {
			location = newLocation;
			$inputEl.val(location.formatted_address);
			var locationArray = [location.geometry.location.lat(), location.geometry.location.lng()];
			if ($coordsEl) {
				$coordsEl.val(locationArray.join(','));
			}
		}
		else {
			location = null;
			$inputEl.val('');
			if ($coordsEl) {
				$coordsEl.val('');
			}
		}
		$inputEl.trigger("change");
	}

	function clearInput() {
		setLocation(null);
	}

	function blur(e) {
		if (e.target != $inputEl[0]) {
			removeResults();
			$(document).off('click', blur);
		}
	}
	$inputEl.keypress(function(e){
		if(e.which == 13) {
			geocoder.geocode({'address': $inputEl.val()}, function (results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					$resultsEl.empty();
					for (var i = 0; i<results.length; i++) {
						var $result = $('<div class="location-picker-result">' + results[i].formatted_address + '</div>');
						$result[0].location = results[i];
						$result.click(function(){
							setLocation(this.location);
						});
						$resultsEl.append($result);
					}
					showResults();
					$(document).on('click', blur);
				}
			});
		}
	});


	function onPositionReceive (location) {
		var latlng = {lat: location.coords.latitude, lng: location.coords.longitude};
		geocoder.geocode({'location': latlng}, function (results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				setLocation(results[0]);
			}
		});
	};

	function showError(error) {
		var errorMessage;
		switch (error.code) {
			case error.PERMISSION_DENIED:
				errorMessage = "User denied the request for Geolocation.";
				break;
			case error.POSITION_UNAVAILABLE:
				errorMessage = "Location information is unavailable.";
				break;
			case error.TIMEOUT:
				errorMessage = "The request to get user location timed out.";
				break;
			case error.UNKNOWN_ERROR:
				errorMessage = "An unknown error occurred.";
				break;
		}
	};



	function getLocationFromBrowser(e) {
		if (e.clientX) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(onPositionReceive, showError);
			}
			else {
				$scope.error = "Geolocation is not supported by this browser.";
			}
		}
		return false;
	};
	$inputEl.focus(clearInput);
	$autoDetectEl.click(getLocationFromBrowser);

	if (options.autoDetect) {
		getLocationFromBrowser({clientX: 1});
	}
};