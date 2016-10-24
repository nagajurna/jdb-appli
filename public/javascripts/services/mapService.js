var mapService = angular.module('app.mapService', [])
.factory("mapService", function($http, $q) {
	
	var mapService = {};
	
	mapService.setMarkers = function(markers) {
			var data = {};
			data.markers = markers;
			$http.post('/api/markers', data);
		}
		
	mapService.getMarkers = function() {
			var defer = $q.defer();
			$http.get('/api/markers').
			then(function(response) {
				defer.resolve({reason: 'got markers', markers: response.data.markers});
			});
								
			return defer.promise;
		}
	
	return mapService;
});
