var sortService = angular.module('app.sortService', [])
.factory("sortService", function($rootScope) {
	
	var sortService = {};
	
	sortService.propertyName = 'cp';
	sortService.setPropertyName = function(name) {
		sortService.propertyName = name;
		$rootScope.$broadcast('sortProperty', {property: sortService.propertyName});
	};
	
	sortService.getPropertyName = function() {
		return sortService.propertyName;
	};
	
	sortService.reverse = false;
	sortService.setReverse = function(reverse) {
		sortService.reverse = reverse;
		$rootScope.$broadcast('sortOrder', {reverse: sortService.reverse});
	}
	
	sortService.getReverse = function() {
		return sortService.reverse;
	};
	
	return sortService;
	
});
