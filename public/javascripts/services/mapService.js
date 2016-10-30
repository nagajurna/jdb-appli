var mapService = angular.module('app.mapService', [])
.factory("mapService", function($rootScope, $http, $q, $route, $location,$interval,$timeout) {
	
	var mapService = {};
	/*setMarkers and getMarkers : save in session last state of markers in case refreshing by user*/
	mapService.setMarkers = function(markers) {
			var data = {};
			data.markers = markers;
			$http.post('/api/markers', data);
		};
		
	mapService.getMarkers = function() {
			var defer = $q.defer();
			$http.get('/api/markers').
			then(function(response) {
				defer.resolve({reason: 'got markers', markers: response.data.markers});
			});
								
			return defer.promise;
		};
		
	mapService.setScrollPosition = function(link, id) {
		//$interval to make sure $location is correct before broadcasting event
		var check, stopCheck;
		
		check = $interval(function() {
			if($location.path()===link) {
				$rootScope.$broadcast('item', {index: id});
				stopCheck();
			} else {
				$location.path(link);
			}
		}, 200);
		
		stopCheck = function() {
			if(angular.isDefined(check)) {
				$interval.cancel(check);
				check = undefined;
			}
		};
	}
	
	mapService.getScrollPosition = function(data) {
		var offset = $('.wrapper').scrollTop() + $('#' + data.index).offset().top-$('.wrapper').offset().top;
		$('.wrapper').animate({
				scrollTop: offset
			},500);
	};
	
	var property='cp';
	mapService.setOrderByProperty = function(name) {
		property = name;
	}
	
	mapService.getOrderByProperty = function() {
		return property;
	}
	
	var reverse = false;
	mapService.setReverse = function(bool) {
		reverse = bool;
	}
	
	mapService.getReverse = function() {
		return reverse;
	}
	
	
	return mapService;
});
