app.config(['$routeProvider', '$locationProvider',
	function($routeProvider,$locationProvider) {
		$routeProvider.
			when('/', {
				template: '<places-index></places-index>',
			}).
			when('/inscription', {
				template: '<sign-up on-refresh="userRefresh(user)"></sign-up>',
			}).
			when('/connexion', {
				template: '<sign-in on-refresh="userRefresh(user)"></sign-in>',
			}).
			when('/profil', {
				template: '<profile user="currentUser"></profile>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkLoggedIn();
					}
				}
			}).
			when('/resetPassword', {
				template: '<reset-password current="currentUser"></reset-password>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkLoggedIn();
					}
				}
			}).
			when('/forgotPassword', {
				template: '<forgot-password></forgot-password>',
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
			when('/admin/games/update/:id', {
				template: '<game-update><game-update>',
				resolve: {
					checkusers: function(authService) {
						return authService.checkAdmin();
					}
				}
			}).
			when('/admin/places', {
				template: '<places on-refresh="markersRefresh(places)"></places>',
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
			when('/admin/places/update/:id', {
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
