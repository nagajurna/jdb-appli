app.config(['$routeProvider', '$locationProvider',
	function($routeProvider,$locationProvider) {
		$routeProvider.
			when('/', {
				template: '<home title="$ctrl.title" markers="$ctrl.markers"></home>',
			}).
			when('/places', {
				template: '<places title="$ctrl.title" view="$ctrl.view" markers="$ctrl.markers"></places>',
			}).
			when('/places/game/:game', {
				template: '<places title="$ctrl.title" view="$ctrl.view" markers="$ctrl.markers"></places-Game>',
			}).
			when('/places/name/:name', {
				template: '<place title="$ctrl.title" placeview="$ctrl.placeview"></place>',
			}).
			when('/places/game/:game/name/:name', {
				template: '<place title="$ctrl.title" placeview="$ctrl.placeview"></place>',
			}).
			when('/places/name/:name/comments/new', {
				template: '<comment-new user="$ctrl.currentUser" on-anonymous="$ctrl.modalLoad(template)" ></comment-new>',
			}).
			when('/places/game/:game/name/:name/comments/new', {
				template: '<comment-new user="$ctrl.currentUser" on-anonymous="$ctrl.modalLoad(template)" ></comment-new>',
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
			when('/admin/games/new', {
				template: '<game-new><game-new>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/games/:name', {
				template: '<game-update><game-update>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/places', {
				template: '<places-admin on-places="$ctrl.markersRefresh(places)"></places-admin>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/places/new', {
				template: '<place-new></place-new>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/places/name/:name/edit', {
				template: '<place-update></place-update>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/places/name/:name/show', {
				template: '<place-admin></place-admin>',
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
			$locationProvider.html5Mode(true);
		
	}]);
