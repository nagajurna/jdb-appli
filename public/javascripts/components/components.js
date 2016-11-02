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
					maxZoom: 18,
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
										  
						var popup = L.popup({closeButton: false, autoPanPadding: L.point(5,60)}).
						setContent(popupContent);
						marker.bindPopup(popup);
												
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
					mapService.setMarkers(newColl);//enregistrer places dans session (en cas de page refresh)
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

main.component('main', {
	templateUrl: '/fragments/main',
	controller: function($scope, $http, $location, $route, authService, mapService) {
			var ctrl = this;
			ctrl.loggedIn = false;
			ctrl.currentUser = null;
			ctrl.markers = {};
			//INITIALISATION DE APP
			ctrl.appInit = function () {
				ctrl.getUser();
				ctrl.getMarkers();
			};
			
			/*USER*/
			//initialisation de loggedIn et currentUser lancée par $scope.appInit
			ctrl.getUser = function() {
				authService.getUser().then(function(user) {
					ctrl.loggedIn = user.loggedIn;
					ctrl.currentUser = user.user;
					ctrl.admin = (ctrl.loggedIn && ctrl.currentUser.role==="ADMIN") ? true : false;
				});
			};
			//mise à jour user (signup, signin) lancée par de 'signUp' et 'signIn' components
			$scope.$on('refreshUser', function(event, user) {
				ctrl.loggedIn = user.loggedIn;
				ctrl.currentUser = user.user;
				ctrl.admin = (ctrl.loggedIn && ctrl.currentUser.role==="ADMIN") ? true : false;
			});
			//log out
			ctrl.signout = function() {
				$http.get('/users/signout').
					then(function(response) {
						ctrl.getUser();
						$location.path('/');
					});
			};
			
			/*ROUTES INTERDITES*/
			$scope.$on('$routeChangeError', function(event, current, previous, rejection) {
				console.log(rejection);
				if(rejection.reason==="route.admin.only") {
					$location.path('/');
				} else if(rejection.reason==="route.loggedIn.only") {
					//$location.path('/');
					//$location.path('/connexion');
					ctrl.toggleDiv('sign-in');
					var path = $location.path().replace('/comments/new','');
					$location.path(path);
					
				}
			});
			
			/*LEAFLET MARKERS*/
			//initialisation des markers lancée par $scope.appInit
			ctrl.getMarkers = function(spots) {
				//aller voir si markers dans express session
				mapService.getMarkers().then(function(value) {
					ctrl.markers = value.markers;
				});	
			};
			//mise à jour des markers
			ctrl.markersRefresh = function(places) {
				ctrl.markers = places;
			}
			
			$scope.$on('position', function(event, position) {
				ctrl.position = position;
			});
			
			//divUser TEMPLATES		
			ctrl.toggleDiv = function(template) {
				ctrl.template = template;
				$('#div-user').toggleClass("in");
				
			}
	}
	
});

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
			$http.get('/api/places').
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
		ctrl.propertyName = mapService.getOrderByProperty();
		ctrl.reverse = mapService.getReverse();
		
		ctrl.showPlaces = function() {
			$http.get('/api/places').
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
		onPlaces: '&'
	},
	controller: function($scope, $route, $http, mapService) {
		var ctrl = this;
		ctrl.propertyName = mapService.getOrderByProperty();
		ctrl.reverse = mapService.getReverse();
		
		ctrl.showPlacesGame = function() {
			$http.get('/api/games/' + $route.current.params.game).
				then(function(response) {
					ctrl.game = response.data;
					ctrl.showPlaces(ctrl.game._id);
				});
		}
				
		ctrl.showPlaces = function(gameId) {
			$http.get('/api/places/game/'  + gameId).
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

places.component('place', {
	templateUrl: '/fragments/places/place',
	controller: function($route, $http, mapService, $sce, toHtmlFilter, $location) {
		
		var ctrl = this;
		
		if($route.current.params.game) {
			ctrl.redirect = "/places/game/" + $route.current.params.game
		} else {
			ctrl.redirect = "/places"
		}
		
		ctrl.path = '/#' + $location.path() + '/comments/new';
		
		ctrl.showComments = function(id) {
			$http.get('/api/comments/place/' + id).
				then(function(response) {
					ctrl.comments = response.data;
					ctrl.comments.forEach(function(comment) {
						comment.text = $sce.trustAsHtml(toHtmlFilter(comment.text));
					});
				});
		};
		
		ctrl.showPlace = function() {
			$http.get('/api/places/'  + $route.current.params.name).
				then(function(response) {
					ctrl.spot = response.data;
					ctrl.spot.description = $sce.trustAsHtml(toHtmlFilter(ctrl.spot.description));
					ctrl.showComments(ctrl.spot._id)
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
				/* POSITION : left */
				/*Init*/
				var w = $('.rightCol').width();
				var barW = $('#game-bar').width();//bar width
				var left = w/2-(barW/2);
				$(element).css("left", left+"px");
				/*on resize*/
				$(window).on('resize', function() {
					var w = $('.rightCol').width();
					var barW = $('#game-bar').width();//bar width
					var left = w/2-(barW/2);
					$(element).css("left", left+"px");
				});
			}
		};
		
});

places.component('placesAdmin', {
	templateUrl: '/fragments/places/placesAdmin',
	bindings: {
		onPlaces: '&'
	},
	controller: function($scope, $http, mapService) {
		
		var ctrl = this;
		ctrl.propertyName = mapService.getOrderByProperty();
		ctrl.reverse = mapService.getReverse();
		
		ctrl.showPlaces = function() {
			$http.get('/api/places').
				then(function(response) {
					 ctrl.spots = response.data;
					 ctrl.onPlaces({places: ctrl.spots});
				});
		};
		
		ctrl.delete = function(id) {
			$http.delete('/api/places/' + id).
				then(function(response) {
					ctrl.showPlaces();
				});
		};
		
		ctrl.position = function(spot) {
			$scope.$emit('position', {id: spot._id, index: ctrl.spots.indexOf(spot), lat: spot.lat, lg: spot.lg});
		};
	}
});

places.component('placeNew', {
	templateUrl: '/fragments/places/new',
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
			$http.post('/api/places', ctrl.spot).
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

places.component('placeAdmin', {
	templateUrl: '/fragments/places/placeAdmin',
	controller: function($route, $http, mapService, $sce, toHtmlFilter, $location) {
		
		var ctrl = this;
		
			
		ctrl.path = $location.path();
		
		ctrl.showComments = function(id) {
			$http.get('/api/admin/comments/place/' + id).
				then(function(response) {
					ctrl.comments = response.data;
					ctrl.comments.forEach(function(comment) {
						comment.text = $sce.trustAsHtml(toHtmlFilter(comment.text));
					});
				});
		};
		
		ctrl.deleteComment = function(id) {
			$http.delete('/api/comments/' + id).
				then(function(response) {
					ctrl.showComments(ctrl.spot._id)
					$location.path(ctrl.path);
				});
		};
		
		ctrl.toggleVisible = function(comment) {
			comment.visible = !comment.visible;
			$http.put('/api/comments/' + comment._id, comment).
				then(function(response) {
					$location.path(ctrl.path);
				});
		}
		
		ctrl.showPlace = function() {
			$http.get('/api/places/'  + $route.current.params.name).
				then(function(response) {
					ctrl.spot = response.data;
					ctrl.spot.description = $sce.trustAsHtml(toHtmlFilter(ctrl.spot.description));
					ctrl.showComments(ctrl.spot._id)
				});
			};
			
	}
});

places.component('placeUpdate', {
	templateUrl: '/fragments/places/update',
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
			$http.put('/api/places/' + id, ctrl.spot).
				then(function(response) {
					console.log(response);
					ctrl.spot = {};
					$location.path('/admin/places');
				});
			};
	}
});

places.component('sortBy', {
	templateUrl: '/fragments/places/sortBy',
	bindings: {
		property: "=",
		reverse: "="
	},
	controller: function(mapService) {
		
		var ctrl = this;
		ctrl.sortBy = function(name) {
			ctrl.property = name;
			mapService.setOrderByProperty(ctrl.property);
		}
		
		ctrl.toggleReverse = function() {
			ctrl.reverse = (ctrl.reverse===true ? false: true);
			mapService.setReverse(ctrl.reverse);
		}
		
		ctrl.labels = {
			nameAlpha: 'nom',
			cp: 'code postal',
			updated: 'date de mise à jour'
		}
	}
});

places.filter('toHtml', function() {
	return function(input) {
		input = input || '';
		var out = '';
		out = input.replace(/\n/g, '<br>');
		return out;
	};
	
});


//comments module
var comments = angular.module('app.comments', []);

comments.component('commentNew', {
	templateUrl: '/fragments/comments/new',
	bindings: {
		user: '<',
		onAnonymous: '&'
	},
	controller: function($http, $route, $location) {
		
		var ctrl = this;
				
		ctrl.showPlace = function() {
			$http.get('/api/places/'  + $route.current.params.name).
				then(function(response) {
					ctrl.spot = response.data;
				});
			};
			
		ctrl.add = function() {
			if(!ctrl.user) {
				ctrl.onAnonymous({template: 'sign-in'});
				return
			}
			ctrl.comment.author = ctrl.user.id;
			ctrl.comment.place = ctrl.spot._id;
			
			$http.post('/api/comments', ctrl.comment).
				then(function(response) {
					ctrl.comment = {};
					var path = $location.path().replace('/comments/new','');
			        $location.path(path);
				});
		};
		
		ctrl.back = function() {
			var path = $location.path().replace('/comments/new','');
			$location.path(path);
		}
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
		
		ctrl.delete = function(id) {
			$http.delete('/api/games/' + id).
				then(function(response) {
					ctrl.showGames();
				});
			};
		}
});

games.component('gameNew', {
	templateUrl: '/fragments/games/new',
	controller: function($http, $location) {
		var ctrl = this;			
		ctrl.add = function() {
			$http.post('/api/games', ctrl.game).
				then(function(response) {
					ctrl.game = {};
					$location.path('/admin/games');
				});
			};
	}
});

games.component('gameUpdate', {
	templateUrl: '/fragments/games/update',
	controller: function($http, $route, $location) {
		var ctrl = this;
		ctrl.showGame = function() {
			$http.get('/api/games/' + $route.current.params.name).
				then(function(response) {
					ctrl.game = response.data;
				});
		};
			
		ctrl.update = function(id) {
			$http.put('/api/games/' + id, ctrl.game).
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
		var w = $('.leftCol').width()+15;
		var h = $('.leftCol').height()-52;
		$("#div-user").css({"width": w+"px", "height": h+"px"});
		/*on resize*/
		$(window).on('resize', function() {
			var w = $('.leftCol').width()+15;
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
