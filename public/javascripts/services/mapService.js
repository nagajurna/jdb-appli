var mapService = angular.module('app.mapService', [])
.factory("mapService", function($rootScope, $http, $q, $route, $location, $interval, $timeout) {
	
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
		
	mapService.setSelectedMarker = function(index) {
		mapService.selectedMarker = index;
	}
	
	mapService.getSelectedMarker = function() {
		return mapService.selectedMarker;
	}
		
	mapService.centerDefault = [48.8660601,2.3565281];
	mapService.zoomDefault = 12;
	
	mapService.setView = function(center, zoom) {
		mapService.center = center;
		mapService.zoom = zoom;
	};
	
	mapService.getView = function() {
		var map = {};
		map.center = mapService.center;
		map.zoom = mapService.zoom;
		return map;
	}
	
	mapService.goToMap = function() {
		$rootScope.$broadcast('goToMap', {placeview: 'map'});
	}
	
	mapService.backToText = function() {
		$rootScope.$broadcast('backToText', {placeview: 'text'});
	}
	
	
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
		}, 100);
		
		stopCheck = function() {
			if(angular.isDefined(check)) {
				$interval.cancel(check);
				check = undefined;
			}
		};
		
		
	}
	
	mapService.getScrollPosition = function() {
		return mapService.scrollPosition;
	}
	
	mapService.scroll = function(data) {
		if(window.innerWidth >= 768) {
			$('#' + data.index).ready(function() {
				$timeout(function() {
					var offset = $('.wrapper').scrollTop() + $('#' + data.index).offset().top-$('.wrapper').offset().top;
					$('.wrapper').animate({
							scrollTop: offset
						},500);
				},400);
			});
		} else {
			$('#' + data.index).ready(function() {
				$timeout(function() {
					if(!$('#' + data.index).offset()) { return }
					var offset = $(window).scrollTop() + $('#' + data.index).offset().top-52;
					$('html, body').animate({
							scrollTop: offset
						},500);
			},400);
			});
			
		}
		//var offset = $('.wrapper').scrollTop() + $('#' + data.index).offset().top-$('.wrapper').offset().top;
		//$('.wrapper').animate({
				//scrollTop: offset
			//},500);
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
