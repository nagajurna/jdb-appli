var authService = angular.module('app.authService', [])
.factory("authService", function($http, $q) {
	
	var authService = {};
	
	authService.checkAdmin = function() {
			var defer = $q.defer();
			$http.get('/users/check').
			then(function(response) {
				if(response.data.loggedIn === true && response.data.user.role==='ADMIN') {
					defer.resolve({reason: 'ok Admin'});
				} else {
					defer.reject({reason: 'route.admin.only'});
				}
			});
								
			return defer.promise;
		}
		
	authService.checkLoggedIn = function() {
			var defer = $q.defer();
			$http.get('/users/check').
			then(function(response) {
				if(response.data.loggedIn === true) {
					defer.resolve({reason: 'ok loggedIn'});
				} else {
					defer.reject({reason: 'route.loggedIn.only'});
				}
			});
								
			return defer.promise;
		}
		
	authService.getUser = function() {
			var defer = $q.defer();
			$http.get('/users/check').
			then(function(response) {
				defer.resolve({loggedIn: response.data.loggedIn, user: response.data.user });
			});
								
			return defer.promise;
		}
		
	return authService;
});
