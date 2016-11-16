//leaflet directive
var leafletDirective = angular.module('app.leaflet', [])
	.directive('leafletMap', function($route, mapService) {
			
		function initialize(scope, element, attrs) {
		/* 3 differents classes (= 3 different uses)
		 * class = "map-lg"
		 * class = "map-sm"
		 * class = "map-sm-place"
		 * */
		
		
		//SIZE
		$(element).css({'height': '100vh'});
		
		//MAP		
		var map = L.map(element[0], {
				zoomControl: false
			});
			
		//ZOOM CONTROL FOR MAP-LG ONLY
		if(attrs.class==='map-lg') {
			L.control.zoom({
					 position:'bottomleft'
				}).addTo(map);
		}
		//LAYER
		L.tileLayer('https://a.tiles.mapbox.com/v4/nagajurna.l3km7gd0/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibmFnYWp1cm5hIiwiYSI6IklzMFRIYXcifQ.hqVc_h3zWIaNXodK_5DnvA#4/48.87/2.36', {
			//attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
			minZoom: 11,
			maxZoom: 18,
		}).addTo(map);
		
		//ICONS
		var GreenIcon = L.Icon.Default.extend({
			options: {
				iconUrl: '../../../../images/leaflet-icon/marker-icon-green.png',
				iconRetinaUrl: '../../../../images/leaflet-icon/marker-icon-2x-green.png'
				}
			});
		
		var greenIcon = new GreenIcon();
		
		var OrangeIcon = L.Icon.Default.extend({
			options: {
				iconUrl: '../../../../images/leaflet-icon/marker-icon-orange.png',
				iconRetinaUrl: '../../../../images/leaflet-icon/marker-icon-2x-orange.png'
				}
			});
		
		var orangeIcon = new OrangeIcon();
		
		//MARKERS	
		var markers = [];//will receive all markers
		
		addMarker = function(places) {
						
			markers = [];//suppress previous markers
			for(i=0; i<places.length; i++)
			{
				if(places[i].lat!=null) {
					var marker = L.marker([places[i].lat, places[i].lg], {icon: greenIcon}).addTo(map);
					//POP-UP
					//Pop-up content
					var link1, link2;//ATTENTION, if same collection for differents games: links incorrect
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
				
					var popupContent = '<a id="link1' + places[i]._id + '" href="' + link1 + '" class="popup-link"><strong>' + places[i].name + '</strong></a></br>' +
									   games + '</br>'
					
					//Pop-up				  
					var popup = L.popup({closeButton: false, autoPanPadding: L.point(5,60), className: 'popup'}).
					setContent(popupContent);
					marker.bindPopup(popup);
										
					//Marker on click						
					var myFunction = function(place) {
						marker.on('click', function(ev) {
							if(attrs.class==="map-sm") {
								mapService.setSelectedMarker(ev.target);
							} else if (attrs.class==="map-lg") {
								mapService.setScrollPosition(link2, place._id)
							}
						});
					}(places[i]);
					
					markers.push(marker);//each marker added to markers
						
				}
			}
		}
		
		removeMarker = function(markers) {
			for(i=0; i<markers.length; i++)
			{
				map.removeLayer(markers[i]);
			}
		}
		//GET ARRAY FOR MARKERS	
		scope.$watchCollection(attrs.source, function(newColl,oldColl,scope) {
			if(attrs.class==="map-lg") {
				//map-lg : refresh only if newcoll different from oldcoll
				if(angular.isDefined(newColl) && !angular.equals(newColl, oldColl)) {
					removeMarker(markers);//suppress all previous markers
					addMarker(newColl);//add new markers
					mapService.setMarkers(newColl);//save new collection in session (in cas of page refresh)
				}
			} else {
				//map-sm : newColl alway equals to oldColl
				if(angular.isDefined(newColl)) {
					removeMarker(markers);//suppress all previous markers
					addMarker(newColl);//add new markers
					mapService.setMarkers(newColl);//save new collection in session (in cas of page refresh)
				}
			} 
		});
		
		//place backToText
		if(attrs.class==="map-sm-place") {
			map.on('popupopen', function() {  
			  $('.popup-link').click(function(e){
				  mapService.backToText();
			  });
			});
		 }
			
		//MAP CENTER AND ZOOM
		var center, zoom;
		if(attrs.class==="map-lg") {
			center = mapService.centerDefault;
			zoom = mapService.zoomDefault;
			map.setView(center, zoom);
		} else if(attrs.class==="map-sm") {
			if(mapService.getView().center) {
				center = mapService.getView().center;
				zoom = mapService.getView().zoom;
			} else {
				center = mapService.centerDefault;
				zoom = mapService.zoomDefaultSm;
			}
			map.setView(center, zoom);
		} else if(attrs.class==='map-sm-place') {
			scope.$watch(attrs.selected, function(newSelected,oldSelected) {
				if(newSelected) {
					center = L.latLng(newSelected.lat,newSelected.lg);
					zoom = 16;
					map.setView(center, zoom);
					//Marker open pop-up
					markers[newSelected.index].setIcon(orangeIcon);
					markers[newSelected.index].openPopup();
				}
			});
		}
		
		//LARGE DEVICES : relation map/list
		if(attrs.class==="map-lg") {
			scope.$watch(attrs.position, function(newPos,oldPos) {
				if(angular.isDefined(newPos)) {
					var bounds = map.getBounds();
					if(!bounds.contains(L.latLng(newPos.lat,newPos.lg))) {
						map.flyTo(L.latLng(newPos.lat,newPos.lg));
					}
					markers[newPos.index].openPopup();
				}
			});
		}
			
		//SMALL DEVICES : keep track of map state
		if(attrs.class==="map-sm") {
			map.on('moveend', function() {
				mapService.setView(map.getCenter(),map.getZoom());
			});
			
			if(mapService.getSelectedMarker()) {
				mapService.getSelectedMarker().getPopup().openOn(map);
			}
		}
	};
	
	return {
		restrict: 'AE',
		link: initialize,
	}
});

//main module
var main = angular.module('app.main', []);

main.component('main', {
	templateUrl: '/fragments/main/main',
	controller: function($scope, $http, $location, $route, authService, mapService) {
			var ctrl = this;
			ctrl.logo = '';
			ctrl.view = 'list';
			ctrl.placeview = 'text';
			//ctrl.loggedIn = false;
			ctrl.currentuser = null;
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
					//ctrl.loggedIn = user.loggedIn;
					ctrl.currentuser = user.user;
					ctrl.admin = (ctrl.currentuser && ctrl.currentuser.role==="ADMIN") ? true : false;
				});
			};
			//mise à jour user (signup, signin) lancée par de 'signUp' et 'signIn' components
			$scope.$on('refreshUser', function(event, user) {
				//ctrl.loggedIn = user.loggedIn;
				ctrl.currentuser = user.user;
				ctrl.admin = (ctrl.currentuser && ctrl.currentuser.role==="ADMIN") ? true : false;
			});
			//log out
			ctrl.signout = function() {
				$http.get('/users/signout').
					then(function(response) {
						ctrl.getUser();
					});
			};
			
			$scope.$on('signout', function(event, data) {
				ctrl.signout();
			});
			
			/*ROUTES INTERDITES*/
			$scope.$on('$routeChangeError', function(event, current, previous, rejection) {
				if(rejection.reason==="route.admin.only") {
					$location.path('/');
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
			
			$scope.$on('position', function(event, position) {
				ctrl.position = position;
			});
			
			ctrl.modalLoad = function(template) {
				ctrl.template = template;
				$("#myModal").modal({show: true});
			}
			
			
			$scope.$on('$routeChangeSuccess', function(event, current, previous) {
				ctrl.views();
				ctrl.logo = ( $location.path()==='/' ? 'JDB' : '' );
				ctrl.hide = ( $location.path()==='/' ? false : true );
			});
			
			//TOGGLE VIEWS
			//button for toggleView
			ctrl.views = function() {
				if($location.path()==='/places' || ($route.current.params.game && !$route.current.params.name)) {
					ctrl.btnViews = true;
				} else {
					ctrl.btnViews = false;
				}
			}
			//toggleView()
			ctrl.toggleView = function() {
				ctrl.view = (ctrl.view==='list' ? 'map' : 'list');
				if(ctrl.view==='map') {
					ctrl.placeview = 'text';
				}
				mapService.setView(null,null);
				mapService.setSelectedMarker(null);
			}
			
			//placeToggleView()
			ctrl.placeToggleView = function() {
				ctrl.placeview = (ctrl.placeview==='text' ? ctrl.placeview = 'map' : ctrl.placeview = 'text');
			}
			//on placeToggleView from map
			$scope.$on('backToText', function(event,data) {
				$scope.$apply(function() {
					ctrl.placeToggleView();
				});
			});
			
			//on placeToggleView from map
			$scope.$on('goToMap', function(event,data) {
				ctrl.placeToggleView();
			});
			
			
			$(window).on('resize', function() {
				if(window.innerWidth > 768) {
					$scope.$apply(function() { 
						ctrl.view='list';
						ctrl.placeView='text';
					});
				 } 
			});
			
	
	}
	
});

main.component('home', {
		templateUrl: '/fragments/main/home',
		bindings: {
			title: '=',
			markers: '='
		},
		controller: function($http) {
			
			var ctrl = this;
			ctrl.title = '';
			
			ctrl.showGames = function() {
				$http.get('/api/games').
					then(function(response) {
						 ctrl.games = response.data;
						 //ctrl.games.unshift({name: "Tous les bars", pathname: ""});
					});
				};
				
			ctrl.showPlaces = function() {
			$http.get('/api/places').
				then(function(response) {
					ctrl.spots = response.data;
					ctrl.markers = ctrl.spots;
					//ctrl.onPlaces({places: ctrl.spots});
				});
			};
			ctrl.showPlaces();
		}
});

main.component('admin', {
		templateUrl: '/fragments/admin/admin'
});

main.component('menuSm', {
		templateUrl: '/fragments/main/menu',
		bindings: {
			title: '=',
			template: '=',
			onCompleted: '&',
			currentuser: '<'
		},
		controller: function($scope, mapService) {
			
			var ctrl = this;
			ctrl.title = "Menu";
			
			ctrl.close = function() {
				mapService.setView(null,null);
				mapService.setSelectedMarker(null);
				ctrl.onCompleted({action: "hide"});
			};
			
			ctrl.signout = function() {
				$scope.$emit('signout');
				$("#myModal").modal('hide');
				//ctrl.onCompleted({action: "hide"});
			}
		}
});

main.component('modal', {
	templateUrl: '/fragments/main/modal',
	bindings: {
		template: '=',
		currentuser: '<'
	},
	controller: function() {
		
		var ctrl = this;
		
		ctrl.title = "";
		
		ctrl.close = function(action) {
			$("#myModal").modal(action);
		};
	}
});

main.directive('gamesBar', function ($http, $route) {
	
	return {
			templateUrl: '/fragments/games/gamesBar',
			restrict: 'A',
			link: function(scope, element, attrs) {
				/* POSITION : left */
				/*Init*/
				var w = $('.rightCol').width();
				var barW = $('#game-bar').width();//bar width
				var left = w/2-(barW/2)+15;
				$(element).css("left", left+"px");
				/*on resize*/
				$(window).on('resize', function() {
					var w = $('.rightCol').width();
					var barW = $('#game-bar').width();//bar width
					var left = w/2-(barW/2)+15;
					$(element).css("left", left+"px");
				});
				
				scope.isActive = function(game) {
					if(game==='tous' && !$route.current.params.game) return true;
					return game===$route.current.params.game;
				}
			}
		};
		
});

//places module
var places = angular.module('app.places', []);

places.component('places', {
	templateUrl: '/fragments/places/places',
	bindings: {
		view: '=',
		title: '=',
		markers: '='
	},
	controller: function($scope, $route, $http, mapService) {
		var ctrl = this;
				
		ctrl.init = function() {
			if($route.current.params.game) {
				ctrl.getGamePlaces();
				ctrl.link = "/places/game/" + $route.current.params.game + "/name/"
			} else {
				ctrl.getPlaces();
				ctrl.link = "/places/name/";
			}
		};
		
		ctrl.getPlaces = function() {
			$http.get('/api/places').
				then(function(response) {
					ctrl.spots = response.data;
					ctrl.markers = ctrl.spots;
					ctrl.title = 'Tous les bars';
				});
		};
		
		ctrl.getGamePlaces = function() {
			$http.get('/api/games/' + $route.current.params.game).
				then(function(response) {
					ctrl.game = response.data;
					ctrl.title = ctrl.game.name;
					return ctrl.game;
				})
				.then(function(game) {
					$http.get('/api/places/game/'  + game._id).
						then(function(response) {
							ctrl.spots = response.data;
							ctrl.markers = ctrl.spots;
						});
				});
		};
		
		//scroll to place
		$scope.$on('item', function(ev,data) {
			mapService.scroll(data);
		});
	}
});

places.component('placesList', {
	templateUrl: '/fragments/places/placesList',
	bindings: {
		spots: '<',
		title: '<',
		link: '<'
	},
	controller: function($rootScope, $scope, $http, $location, mapService, $filter) {
		var ctrl = this;
		ctrl.propertyName = mapService.getOrderByProperty();
		ctrl.reverse = mapService.getReverse();
		
		ctrl.getComments = function() {
			$http.get('/api/comments').
				then(function(response) {
					ctrl.comments = response.data;
				});
		};
		
		ctrl.getComments();
		
		ctrl.commentsCount = function(id) {
			var count;
			if($filter('filter')(ctrl.comments, id)) {
				count = $filter('filter')(ctrl.comments, id).length;
			}
			return count;
		};
			
		//marker in view and popup open
		ctrl.position = function(spot) {
			$scope.$emit('position', {index: ctrl.spots.indexOf(spot), lat: spot.lat, lg: spot.lg});
		};
		
		ctrl.goToPlace = function(spot) {
			$location.path(ctrl.link + spot.nameAlpha);
			$scope.$emit('position', {index: ctrl.spots.indexOf(spot), lat: spot.lat, lg: spot.lg});
		}
	}
});

places.component('place', {
	templateUrl: '/fragments/places/place',
	bindings: {
		view: '<',
		placeview: '<',
		title: '='
	},
	controller: function($route, $http, mapService, $sce, toHtmlFilter, $location) {
		
		var ctrl = this;
		
		ctrl.init = function() {
			if($route.current.params.game) {
				ctrl.getGamePlaces();
			} else {
				ctrl.getPlaces();
			}
		};
		
		ctrl.getPlace = function(spots) {
			var pathname = $route.current.params.name;
			for(var i=0; i<spots.length; i++) {
			  if(spots[i]['nameAlpha']===pathname) {
				  ctrl.spot = spots[i];
				  ctrl.spot.index = i;
				  ctrl.spot.description = $sce.trustAsHtml(toHtmlFilter(ctrl.spot.description));
				  break;
			  }
			}
			return ctrl.spot;
		}
		
		ctrl.getPlaces = function() {
			$http.get('/api/places').
				then(function(response) {
					ctrl.spots = response.data;
					ctrl.markers = ctrl.spots;
					ctrl.title = 'Tous les bars';
					ctrl.spot = ctrl.getPlace(ctrl.spots);
					ctrl.comments = ctrl.getComments(ctrl.spot._id)
					
				});
		};
		
		ctrl.getGamePlaces = function() {
			$http.get('/api/games/' + $route.current.params.game).
				then(function(response) {
					ctrl.game = response.data;
					ctrl.title = ctrl.game.name;
					return ctrl.game;
				})
				.then(function(game) {
					$http.get('/api/places/game/'  + game._id).
						then(function(response) {
							ctrl.spots = response.data;
							ctrl.markers = ctrl.spots;
							ctrl.spot = ctrl.getPlace(ctrl.spots);
							ctrl.comments = ctrl.getComments(ctrl.spot._id)
						});
				});
		};
		
		ctrl.getComments = function(id) {
			$http.get('/api/comments/place/' + id).
				then(function(response) {
					ctrl.comments = response.data;
					ctrl.comments.forEach(function(comment) {
						comment.text = $sce.trustAsHtml(toHtmlFilter(comment.text));
					});
					return ctrl.comments;
				});
		};
		
	}
});

places.component('placeText', {
	templateUrl: '/fragments/places/placeText',
	bindings: {
		view: '<',
		spot: '<',
		comments: '<'
	},
	controller: function($route, $http, mapService, $sce, toHtmlFilter, $location) {
		
		var ctrl = this;
		
		if($route.current.params.game) {
			ctrl.redirect = "/places/game/" + $route.current.params.game
		} else {
			ctrl.redirect = "/places";
		}
		
		ctrl.newCommentPath = $location.path() + '/comments/new';
		
		ctrl.back = function() {
			if(ctrl.view==='list') {
				mapService.setScrollPosition(ctrl.redirect,ctrl.spot._id);
			} else {
				$location.path(ctrl.redirect);
			}
		};
		
		ctrl.placeToggleView = function() {
			mapService.goToMap();
		}
	}
});



places.component('placesAdmin', {
	templateUrl: '/fragments/places/placesAdmin',
	bindings: {
		markers: '='
	},
	controller: function($scope, $http, mapService) {
		
		var ctrl = this;
		ctrl.propertyName = mapService.getOrderByProperty();
		ctrl.reverse = mapService.getReverse();
		
		ctrl.getPlaces = function() {
			$http.get('/api/places').
				then(function(response) {
					 ctrl.spots = response.data;
					 ctrl.markers = ctrl.spots;
				});
		};
		
		ctrl.delete = function(id) {
			$http.delete('/api/places/' + id).
				then(function(response) {
					ctrl.getPlaces();
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
		ctrl.form= {};
		ctrl.spot = {};
		
		ctrl.getGames = function() {
			$http.get('/api/games').
				then(function(response) {
					ctrl.games = response.data;
				});
			};
		
		ctrl.add = function() {
			ctrl.spot.games = ctrl.gameIds;
			$http.post('/api/places', ctrl.spot).
				then(function(response) {
					if(response.data.saved===false) {
						console.log(response.data.reason);
						if(response.data.reason.name === 'ValidationError') {
							ctrl.form.errors = response.data.reason.errors;
						} else {
							ctrl.form.message = "Problème au moment de l\'enregistrement";
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
		
		ctrl.getComments = function(id) {
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
					ctrl.getComments(ctrl.spot._id)
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
		
		ctrl.getPlace = function() {
			$http.get('/api/places/'  + $route.current.params.name).
				then(function(response) {
					ctrl.spot = response.data;
					ctrl.spot.description = $sce.trustAsHtml(toHtmlFilter(ctrl.spot.description));
					ctrl.getComments(ctrl.spot._id)
				});
			};
			
	}
});

places.component('placeUpdate', {
	templateUrl: '/fragments/places/update',
	controller: function($http, $route, $location) {
		
		var ctrl = this;
		ctrl.form = {};
		
		ctrl.init = function() {
			ctrl.getGames();
			ctrl.getPlace();
		};
		
		ctrl.getGames = function() {
			$http.get('/api/games').
				then(function(response) {
					ctrl.games = response.data;
				});
			};
		
		ctrl.getPlace = function() {
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
			
		ctrl.update = function(id) {
			ctrl.spot.games = ctrl.gameIds;
			$http.put('/api/places/' + id, ctrl.spot).
				then(function(response) {
					if(response.data.saved===false) {
						console.log(response.data.reason);
						if(response.data.reason.name === 'ValidationError') {
							ctrl.form.errors = response.data.reason.errors;
						} else {
							ctrl.form.message = "Problème au moment de l\'enregistrement";
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
		currentuser: '<',
		onAnonymous: '&'
	},
	controller: function($http, $route, $location) {
		
		var ctrl = this;
		ctrl.path = $location.path().replace('/comments/new','');
		ctrl.form = {};
		ctrl.comment = {};
				
		ctrl.getPlace = function() {
			$http.get('/api/places/'  + $route.current.params.name).
				then(function(response) {
					ctrl.spot = response.data;
				});
			};
			
		ctrl.add = function() {
			if(!ctrl.currentuser) {
				console.log(ctrl.currentuser);
				ctrl.onAnonymous({template: 'sign-in'});
				return
			}
			ctrl.comment.author = ctrl.currentuser.id;
			ctrl.comment.place = ctrl.spot._id;
			
			$http.post('/api/comments', ctrl.comment).
				then(function(response) {
					if(response.data.saved===false) {
						if(response.data.reason.name === "ValidationError")
						{
							ctrl.form.errors = response.data.reason.errors;
						} else {
							ctrl.form.message = "Problème au moment de l\'enregistrement";
						}
						
					} else {
						ctrl.comment = {};
						ctrl.form = {};
						$location.path(ctrl.path);
					}
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
		
		ctrl.getGames = function() {
			$http.get('/api/games').
				then(function(response) {
					 ctrl.games = response.data;
				});
			};
		
		ctrl.delete = function(id) {
			$http.delete('/api/games/' + id).
				then(function(response) {
					ctrl.getGames();
				});
			};
		}
});

games.component('gameNew', {
	templateUrl: '/fragments/games/new',
	controller: function($http, $location) {
		
		var ctrl = this;
		ctrl.form = {};
		ctrl.game = {};
					
		ctrl.add = function() {
			$http.post('/api/games', ctrl.game).
				then(function(response) {
					if(response.data.saved===false) {
						if(response.data.reason.name==='ValidationError') {
							ctrl.form.errors = response.data.reason.errors;
						} else {
							ctrl.form.message = 'Problème au moment de l\'enregistrement';
						}
						
					} else {
						ctrl.form = {};
						ctrl.game = {};
						$location.path('/admin/games');
					}
				});
			};
	}
});

games.component('gameUpdate', {
	templateUrl: '/fragments/games/update',
	controller: function($http, $route, $location) {
		
		var ctrl = this;
		ctrl.form = {};
		
		ctrl.getGame = function() {
			$http.get('/api/games/' + $route.current.params.name).
				then(function(response) {
					ctrl.game = response.data;
				});
		};
			
		ctrl.update = function(id) {
			$http.put('/api/games/' + id, ctrl.game).
				then(function(response) {
					if(response.data.saved===false) {
						if(response.data.reason.name==='ValidationError') {
							console.log(response.data);
							ctrl.form.errors = response.data.reason.errors;
						} else {
							ctrl.form.message = 'Problème au moment de l\enregistrement';
						}
					} else {
						ctrl.form = {};
						ctrl.game = {};
						$location.path('/admin/games');
					}
				});
		};
	}
});

//users module	
var users = angular.module('app.users', []);

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
							$scope.$emit('refreshUser', user);
							$("#myModal").modal('hide');
							//ctrl.onCompleted({action: "hide"});
						});
					}
				});
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
							$scope.$emit('refreshUser', user);
							$("#myModal").modal('hide');
							//ctrl.onCompleted({action: "hide"});
						});
					}
				});
		};		
		
	}
});

users.component('profile', {
	templateUrl: '/fragments/users/profile',
	bindings: {
		currentuser: '<',
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
		currentuser: '<',
		title: '=',
		template: '='
	},
	controller: function($http, authService) {
		var ctrl = this;
		ctrl.title = "Modifier votre mot de passe";
		ctrl.user = {};
		ctrl.form = {};
				
		ctrl.resetPassword = function() {
			ctrl.user.email = ctrl.currentuser.email;
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
						ctrl.form.success = response.data.message;
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
