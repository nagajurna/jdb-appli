app.config(['$routeProvider', '$locationProvider',
	function($routeProvider,$locationProvider) {
		$routeProvider.
			when('/', {
				template: '<home on-places="markersRefresh(places)"></home>',
			}).
			when('/places', {
				template: '<places on-places="markersRefresh(places)"></places>',
			}).
			when('/places/game/:game', {
				template: '<places-Game on-game="markersRefresh(places)"></places-Game>',
			}).
			when('/places/name/:name', {
				template: '<place></place>',
			}).
			when('/places/game/:game/name/:name', {
				template: '<place></place>',
			}).
			when('/forgotPassword/reset', {
				template: '<forgot-password-reset></forgot-password-reset>'
			}).
			when('/admin', {
				template: '<admin></admin>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/games', {
				template: '<games></games>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/games/add', {
				template: '<game-add><game-add>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/games/update/:name', {
				template: '<game-update><game-update>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/places', {
				template: '<places-admin on-refresh="markersRefresh(places)"></places-admin>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/places/add', {
				template: '<place-add></place-add>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/places/update/:name', {
				template: '<place-update></place-update>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			otherwise({
				redirectTo: '/'
			});
			
			 //use the HTML5 History API
			$locationProvider.html5Mode({
			  enabled: false,
			  requireBase: false,
			  rewriteLinks: false
			});
		
	}]);
