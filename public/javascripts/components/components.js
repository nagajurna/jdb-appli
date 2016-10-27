//leaflet directive
var leafletDirective = angular.module('app.leaflet', [])
	.directive('myLeaflet', function($route, mapService) {
			
		function initialize(scope, element, attrs) {
			var wh = window.innerHeight;
			$('.content').css({'height': wh + 'px'});
			$(element).css({'height': wh + 'px'});
						
			$(window).on('resize', function() {
				
				var wh = window.innerHeight;
				$('.content').css({'height': wh + 'px'});
				$(element).css({'height': wh + 'px'});
			});
			//var map = L.map(element[0]).setView([48.8660601,2.3565281], 13);
			var map = L.map(element[0], {
				center: [48.8660601,2.3565281],
				zoom: 13
			});
			
			L.tileLayer('https://a.tiles.mapbox.com/v4/nagajurna.l3km7gd0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibmFnYWp1cm5hIiwiYSI6IklzMFRIYXcifQ.hqVc_h3zWIaNXodK_5DnvA#4/48.87/2.36', {
					attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
					minZoom: 12,
					maxZoom: 18
				}).addTo(map);
				
			var markers = [];//destiné à recueillir tous les markers
			addMarker = function(places) {
				markers = [];//supprime précédents markers
				for(i=0; i<places.length; i++)
				{
					if(places[i].lat!=null) {
						var marker = L.marker([places[i].lat, places[i].lg]).addTo(map);
						
						var link1, link2;//ATTENTION, si même collection pour différents jeux: liens faux
						if($route.current.params.game) {
							link1 = "/#/places/game/" + $route.current.params.game + "/name/" + places[i].nameAlpha;
							link2 = "/places/game/" + $route.current.params.game;
						} else {
							link1 = "/#/places/name/" + places[i].nameAlpha;
							link2 = "/places";
						}
						
						var games ='';
						var virg;
						for(j=0; j<places[i].games.length; j++)
						{
							j<places[i].games.length-1 ? virg = ', ' : virg = '';
							if(j==0)
							{
								places[i].games[j].name = places[i].games[j].name.replace(/^./, places[i].games[j].name.charAt(0).toUpperCase());
							}
							games += '<span>' + places[i].games[j].name + virg + '</span>';
						}
					
						
						var popupContent = '<a id="link1' + places[i]._id + '" href="' + link1 + '" >' + places[i].name + '</a></br>' +
										   games + '</br>'
										  
						
						marker.bindPopup(popupContent);
												
						var myFunction = function(place) {
							marker.on('click', function(ev) {
								mapService.setScrollPosition(link2, place._id)
							});
						};
						myFunction(places[i]);
						
						markers.push(marker);//chaque marker est ajouté à markers
							
					}
				}
			}
			
			
			
			removeMarker = function(markers) {
				for(i=0; i<markers.length; i++)
				{
					map.removeLayer(markers[i]);
				}
			}
			
			scope.$watchCollection(attrs.source, function(newColl,oldColl,scope) {
				if(angular.isDefined(newColl) && !angular.equals(newColl,oldColl)) {
					removeMarker(markers);//supprimer tous les markers
					addMarker(newColl);//ajouter markers
				}
			});
			
			scope.$watch(attrs.position, function(newPos,oldPos) {
				if(angular.isDefined(newPos)) {
					var bounds = map.getBounds();
					if(!bounds.contains(L.latLng(newPos.lat,newPos.lg))) {
						map.flyTo(L.latLng(newPos.lat,newPos.lg));
					}
					markers[newPos.index].openPopup();
				}
			});
			
			
		};
		
		return {
			restrict: 'AE',
			link: initialize,
		};
	});

//admin module
var main = angular.module('app.main', []);

main.component('home', {
		templateUrl: '/fragments/home',
		bindings: {
			onPlaces: '&'
		},
		controller: function($http) {
			var ctrl = this;
			ctrl.showGames = function() {
				$http.get('/api/games').
					then(function(response) {
						 ctrl.games = response.data;
					});
				};
				
			ctrl.showPlaces = function() {
			$http.get('/api/places/').
				then(function(response) {
					ctrl.spots = response.data;
					ctrl.onPlaces({places: ctrl.spots});
				});
			};
			ctrl.showPlaces();
		}
});

main.component('admin', {
		templateUrl: '/fragments/admin/admin'
});

//places module
var places = angular.module('app.places', []);

places.component('places', {
	templateUrl: '/fragments/places/places',
	bindings: {
		onPlaces: '&'
	},
	controller: function($scope, $http, mapService) {
		var ctrl = this;
		
		ctrl.showPlaces = function() {
			$http.get('/api/places/').
				then(function(response) {
					ctrl.spots = response.data;
					ctrl.onPlaces({places: ctrl.spots});
				});
			};
			
		ctrl.position = function(spot) {
			$scope.$emit('position', {id: spot._id, index: ctrl.spots.indexOf(spot), lat: spot.lat, lg: spot.lg});
		};
		
		
		$scope.$on('item', function(ev,data) {
			mapService.getScrollPosition(data);
		});
	}
});

places.component('placesGame', {
	templateUrl: '/fragments/places/placesGame',
	bindings: {
		onGame: '&'
	},
	controller: function($scope, $route, $http, mapService) {
		var ctrl = this;
		
		ctrl.showGame = function() {
			$http.get('/api/game/' + $route.current.params.game).
				then(function(response) {
					ctrl.game = response.data;
				});
		}
				
		ctrl.showPlaces = function() {
			ctrl.showGame();
			$http.get('/api/places/game/'  + $route.current.params.game).
				then(function(response) {
					ctrl.spots = response.data;
					ctrl.onGame({places: ctrl.spots});
				});
			};
			
		ctrl.position = function(spot) {
			$scope.$emit('position', {id: spot._id, index: ctrl.spots.indexOf(spot), lat: spot.lat, lg: spot.lg});
		};
		
		$scope.$on('item', function(ev,data) {
			mapService.getScrollPosition(data);
		});
	}
});

places.component('place', {
	templateUrl: '/fragments/places/place',
	controller: function($scope, $route, $http, mapService) {
		
		var ctrl = this;
		
		if($route.current.params.game) {
			ctrl.redirect = "/places/game/" + $route.current.params.game
		} else {
			ctrl.redirect = "/places"
		}
		
		ctrl.showPlace = function() {
			$http.get('/api/places/'  + $route.current.params.name).
				then(function(response) {
					ctrl.spot = response.data;
				});
			};
			
		ctrl.back = function() {
			mapService.setScrollPosition(ctrl.redirect,ctrl.spot._id);
		};
	}
});

places.directive('gamesBar', function ($http) {
	
	return {
			templateUrl: '/fragments/games/gamesBar',
			restrict: 'A',
			link: function(scope, element, attrs) {
				/* GAMES */
				scope.showGames = function() {
					$http.get('/api/games').
						then(function(response) {
							scope.games = response.data;
						})
					};
				scope.showGames();
				
				/* POSITION : left */
				/*Init*/
				var w = $('.rightCol').width();
				var left = w/2-(768/2);//768=BAR WIDTH
				$(element).css("left", left+"px");
				/*on resize*/
				$(window).on('resize', function() {
					var w = $('.rightCol').width();
					var left = w/2-(768/2);
					$(element).css("left", left+"px");
				});
			}
		};
		
});

places.component('placesAdmin', {
	templateUrl: '/fragments/places/placesAdmin',
	bindings: {
		onRefresh: '&'
	},
	controller: function($scope, $http) {
		var ctrl = this;
		ctrl.showPlaces = function() {
			$http.get('/api/places').
				then(function(response) {
					 ctrl.spots = response.data;
					 ctrl.onRefresh({places: ctrl.spots});
				});
		};
		
		ctrl.remove = function(id) {
			$http.delete('/api/places/delete/' + id).
				then(function(response) {
					ctrl.showPlaces();
				});
		};
	}
});

places.component('placeAdd', {
	templateUrl: '/fragments/places/placeAdd',
	controller: function($http, $location) {
		var ctrl = this;
		ctrl.spot = {};
		
		ctrl.getGames = function() {
			$http.get('/api/games').
				then(function(response) {
					ctrl.games = response.data;
				});
			};
		
		ctrl.add = function() {
			ctrl.spot.games = ctrl.gameIds;
			console.log(ctrl.gameIds);
			$http.post('/api/places/add', ctrl.spot).
				then(function(response) {
					if(response.data.saved===false) {
						console.log(response.data.reason);
						if(response.data.reason.name === 'ValidationError') {
							ctrl.form.errors = response.data.reason.errors;
						} else {
							console.log(response.data.reason);
						}
					} else {
						ctrl.spot = {};
						ctrl.gameIds = {};
						ctrl.form = {};
						$location.path('/admin/places');
					}
				});
			};
	}
});

places.component('placeUpdate', {
	templateUrl: '/fragments/places/placeUpdate',
	controller: function($http, $route, $location) {
		var ctrl = this;
		ctrl.getGames = function() {
			$http.get('/api/games').
				then(function(response) {
					ctrl.games = response.data;
				});
			};
		
		/* GET PLACE */
		ctrl.showPlace = function() {
			/* get games */
			ctrl.getGames();
			/* get place*/
			$http.get('/api/places/' + $route.current.params.name).
				then(function(response) {
					ctrl.spot = response.data;
					ctrl.gameIds = {};
					//check place games
					angular.forEach(ctrl.spot.games, function(value) {
						ctrl.gameIds[value._id] = true;
					});
				});
			};
			
		/* UPDATE PLACE */
		ctrl.update = function(id) {
			ctrl.spot.games = ctrl.gameIds;
			$http.put('/api/places/update/' + id, ctrl.spot).
				then(function(response) {
					console.log(response);
					ctrl.spot = {};
					$location.path('/admin/places');
				});
			};
	}
});

//games module	
var games = angular.module('app.games', []);

games.component('games', {
	templateUrl: '/fragments/games/games',
	controller: function($http) {
		var ctrl = this;
		ctrl.showGames = function() {
			$http.get('/api/games').
				then(function(response) {
					 ctrl.games = response.data;
				});
			};
		
		ctrl.remove = function(id) {
			$http.delete('/api/games/delete/' + id).
				then(function(response) {
					ctrl.showGames();
				});
			};
		}
});

games.component('gameAdd', {
	templateUrl: '/fragments/games/gameAdd',
	controller: function($http, $location) {
		var ctrl = this;			
		ctrl.add = function() {
			$http.post('/api/games/add', ctrl.game).
				then(function(response) {
					ctrl.game = {};
					$location.path('/admin/games');
				});
			};
	}
});

games.component('gameUpdate', {
	templateUrl: '/fragments/games/gameUpdate',
	controller: function($http, $route, $location) {
		var ctrl = this;
		ctrl.showGame = function() {
			$http.get('/api/game/' + $route.current.params.name).
				then(function(response) {
					ctrl.game = response.data;
				});
		};
			
		ctrl.update = function(id) {
			$http.put('/api/games/update/' + id, ctrl.game).
				then(function(response) {
					ctrl.game = {};
					$location.path('/admin/games');
				});
		};
	}
});

//users module	
var users = angular.module('app.users', []);

users.component('divUser', {
	templateUrl: '/fragments/users/divUser',
	bindings: {
		template: '=',
		user: '<'
	},
	controller: function() {
		
		var ctrl = this;	
		
		/* SIZE */
		/*Init*/
		var w = $('.leftCol').width();
		var h = $('.leftCol').height()-52;
		$("#div-user").css({"width": w+"px", "height": h+"px"});
		/*on resize*/
		$(window).on('resize', function() {
			var w = $('.leftCol').width();
			var h = $('.leftCol').height()-52;
			$("#div-user").css({"width": w+"px", "height": h+"px"});
		});
		
		ctrl.close = function(action) {
			$('#div-user').toggleClass("in");
		}
			
	}
	
});

users.component('signUp', {
	templateUrl: '/fragments/users/signUp',
	bindings: {
		title: '=',
		template: '=',
		onCompleted: '&'
	},
	controller: function($scope, $http, $location,authService) {
		var ctrl = this;
		ctrl.title = "Inscription";
		ctrl.user = {};
		ctrl.form = {};
		
		ctrl.signup = function() {
			$http.post('/users/signup', ctrl.user).
				then(function(response) {
					ctrl.form = {};
					if(response.data.loggedIn===false) {
						if(response.data.reason.name === 'ValidationError') {
							ctrl.form.errors = response.data.reason.errors;
						} else if (response.data.reason.name === 'AuthentificationError') {
							ctrl.form.message = response.data.reason.message;
						} else {
							ctrl.form.message = 'problème au moment de l\'enregistrement';
						}
					} else {
						ctrl.user = {};
						ctrl.form = {};
						authService.getUser().then(function(user) {
							ctrl.onCompleted({action: "hide"});
							$scope.$emit('refreshUser', user);
							//$location.path(ctrl.redirect);
						});
					}
				});
		};
		
		ctrl.modalLoad = function(template) {
			ctrl.template = template;
		};
	}
});

users.component('signIn', {
	templateUrl: '/fragments/users/signIn',
	bindings: {
		title: '=',
		template: '=',
		onCompleted: '&'
	},
	controller: function($scope, $http, $location, $route, authService) {
		
		var ctrl = this;
		ctrl.title = "Connexion";
		ctrl.user = {};
		ctrl.form = {};
		
		ctrl.signin = function() {
			$http.post('/users/signin', ctrl.user).
				then(function(response) {
					if(response.data.loggedIn===false) {
						ctrl.form = {};
						if(response.data.reason.name === 'ValidationError') {
							ctrl.form.errors = response.data.reason.errors;
						} else if (response.data.reason.name === 'AuthentificationError') {
							ctrl.form.message = response.data.reason.message;
						} else {
							ctrl.form.message = 'problème au moment de l\'enregistrement';
						}
					} else {
						ctrl.user = {};
						ctrl.form = {};
						authService.getUser().then(function(user) {
							ctrl.onCompleted({action: "hide"});
							$scope.$emit('refreshUser', user);
							//$location.path(ctrl.redirect);
							
						});
					}
				});
		};
		
		ctrl.modalLoad = function(template) {
			ctrl.template = template;
		};	
		
		
	}
});

users.component('profile', {
	templateUrl: '/fragments/users/profile',
	bindings: {
		user: '<',
		title: '=',
		template: '='
	},
	controller: function() {
		var ctrl = this;
		ctrl.title = "Profil";
	}
});

users.component('resetPassword', {
	templateUrl: '/fragments/users/resetPassword',
	bindings: {
		user: '<',
		title: '=',
		template: '='
	},
	controller: function($http, authService) {
		var ctrl = this;
		ctrl.title = "Modifier votre mot de passe";
		ctrl.user = {};
		ctrl.form = {};
				
		ctrl.resetPassword = function() {
			ctrl.user.email = ctrl.user.email;
			$http.put('/users/resetPassword', ctrl.user).
				then(function(response) {
					console.log(response.data);
					if(response.data.reset===false) {
						ctrl.form = {};
						if(response.data.reason.name === 'ValidationError') {
							ctrl.form.errors = response.data.reason.errors;
						} else if (response.data.reason.name === 'AuthentificationError') {
							ctrl.form.message = response.data.reason.message;
						} else {
							ctrl.form.message = 'problème au moment de l\'enregistrement';
						}
					} else if(response.data.reset===true) {
						ctrl.user = {};
						ctrl.form = {};
						ctrl.form.message = response.data.message;
					}
				});
		};
		
	}
});

users.component('forgotPassword', {
	templateUrl: '/fragments/users/forgotPassword',
	bindings: {
		title: '=',
		template: '=',
	},
	controller: function($http) {
		
		var ctrl = this;
		ctrl.title = 'Mot de passe oublié';
		ctrl.user = {};
		ctrl.form = {};
		
		ctrl.mailSent = false;
		
		ctrl.forgotPassword = function () {
			$http.post('/users/forgotPassword', ctrl.user).
				then(function(response) {
					if(response.data.mailSent===false) {
						ctrl.form = {};
						if(response.data.reason.name === 'ValidationError') {
							ctrl.form.errors = response.data.reason.errors;
						} else if (response.data.reason.name === 'AuthentificationError') {
							ctrl.form.message = response.data.reason.message;
						} else {
							ctrl.form.message = 'Désolé, votre demande n\a pas pu aboutir. Veuillez recommencez.';
						}
					} else if(response.data.mailSent===true) {
						ctrl.mailSent = response.data.mailSent;
						ctrl.form.message = response.data.message;
					}
				});
		};
		
		ctrl.modalLoad = function(template) {
			ctrl.template = template;
		};	
	}
});

users.component('forgotPasswordReset', {
	templateUrl: '/fragments/users/forgotPasswordReset',
	controller: function($http, $location) {
		
		var ctrl = this;
		ctrl.user = {};
		ctrl.form = {};
		
		ctrl.forgotPasswordReset = function () {
			var query = $location.search();
			ctrl.user.email = query.mail;
			ctrl.user.token = query.token;
			$http.put('/users/forgotPassword/reset', ctrl.user).
				then(function(response) {
					console.log(response.data);
					if(response.data.reset===false) {
						if(response.data.reason.name === 'ValidationError') {
							ctrl.form.errors = response.data.reason.errors;
						} else if (response.data.reason.name === 'AuthentificationError') {
							ctrl.form.message = response.data.reason.message;
						} else {
							ctrl.form.message = 'Désolé, votre demande n\a pas pu aboutir. Veuillez recommencez.';
						}
												
					} else if(response.data.reset===true) {
						/*effacer mail et token de l'url*/
						$location.search('mail', null);
						$location.search('token', null);
						/*redirection pour connexion*/
						$location.path('/connexion');
					}
				});
		};	
	}
});
