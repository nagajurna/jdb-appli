app.controller("mainController", ['$scope','$http','$location','$route','authService','mapService',
	function mainController($scope, $http, $location, $route, authService, mapService) {
		//INITIALISATION DE APP
		$scope.appInit = function () {
			$scope.loggedIn = false;
			$scope.currentUser = null;
			$scope.markers = {};
			$scope.getUser();
			$scope.getMarkers();
		};
		/*USER*/
		//initialisation de loggedIn et currentUser lancée par $scope.appInit
		$scope.getUser = function() {
			authService.getUser().then(function(user) {
				$scope.loggedIn = user.loggedIn;
				$scope.currentUser = user.user;
				$scope.admin = ($scope.loggedIn && $scope.currentUser.role==="ADMIN") ? true : false;
			});
		};
		
		//mise à jour user (signup, signin) lancée par de 'signUp' et 'signIn' components
		$scope.$on('refreshUser', function(event, user) {
			console.log(user);
			$scope.loggedIn = user.loggedIn;
			$scope.currentUser = user.user;
			$scope.admin = ($scope.loggedIn && $scope.currentUser.role==="ADMIN") ? true : false;
		});
		//log out
		$scope.signout = function() {
			$http.get('/users/signout').
				then(function(response) {
					$scope.getUser();
					$location.path('/');
				});
		};
		
		/*ROUTES INTERDITES*/
		$scope.$on('$routeChangeError', function(event, current, previous, rejection) {
			console.log(rejection);
			if(rejection.reason==="route.admin.only") {
				$location.path('/');
			} else if(rejection.reason==="route.loggedIn.only") {
				$location.path('/connexion');
			}
		});
		
					
		/*LEAFLET MARKERS*/
		//initialisation des markers lancée par $scope.appInit
		$scope.getMarkers = function(spots) {
			//aller voir si markers dans express session
			mapService.getMarkers().then(function(value) {
				$scope.markers = value.markers;
			});	
		};
		//mise à jour des markers
		$scope.markersRefresh = function(places) {
			$scope.markers = places;
		}
		
		$scope.$on('position', function(event, position) {
			$scope.position = position;
		});
		
		
		
			
		/*UTILITAIRES*/
		$scope.isActive = function(path) {
			if($location.path()===path) {
				return true;
			}
			return false;
		};
		
		//divUser TEMPLATES
				
		$scope.toggleDiv = function(template) {
			$scope.template = template;
			$('#div-user').toggleClass("in");
			
		}
		
			
	}]);

