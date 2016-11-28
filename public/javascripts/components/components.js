//leaflet directive
var leafletDirective = angular.module('app.leaflet', [])
	.directive('leafletMap', ['$route', 'mapService', function($route, mapService) {
			
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
		
		var RedIcon = L.Icon.Default.extend({
			options: {
				iconUrl: '../../../../images/leaflet-icon/marker-icon-red.png',
				iconRetinaUrl: '../../../../images/leaflet-icon/marker-icon-2x-red.png'
				}
			});
		
		var redIcon = new RedIcon();
		
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
					var popupContent;
					if(attrs.class==="map-sm") {
						popupContent = '<span id="' + places[i].nameAlpha + '" class="popup-link"><strong>' + places[i].name + '</strong></span></br>' + games + '</br>'
					} else {
						popupContent = '<a id="' + places[i].nameAlpha + '" href="' + link1 + '" class="popup-link"><strong>' + places[i].name + '</strong></a></br>' + games + '</br>'
					}
					
					//Pop-up				  
					var popup = L.popup({closeButton: false, autoPanPadding: L.point(5,60), className: 'popup'}).
					setContent(popupContent);
					marker.bindPopup(popup);
					
					//Pop-up link on click (map-sm : placeModal)
					$(element).unbind().on("click", ".popup-link", function(e){
						if(attrs.class==="map-sm") {
							mapService.setPlaceModal(e.target.parentElement.id);
						}
					});
					
					//Marker on click						
					var myFunction = function(place) {
						marker.on('click', function(ev) {
							if(attrs.class==="map-sm") {
								//mapService.setSelectedMarker(ev.target);
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
				//mapService.setSelectedMarker(null);
				map.removeLayer(markers[i]);
			}
		}
		//GET ARRAY FOR MARKERS	
		scope.$watchCollection(attrs.source, function(newColl,oldColl,scope) {
			 if(angular.isDefined(newColl)) {
				removeMarker(markers);//suppress all previous markers
				addMarker(newColl);//add new markers
				//mapService.setMarkers(newColl);//save new collection in session (in cas of page refresh)
			}
		});
		
		//place backToText
		if(attrs.class==="map-sm-place") {
			map.on('popupopen', function() {  
			  $('.popup-link').click(function(e){
				  mapService.backToText(e.target);
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
					if(markers[newPos.index]) {
						markers[newPos.index].openPopup();
					}
				}
			});
		}
			
		//SMALL DEVICES : keep track of map state
		if(attrs.class==="map-sm") {
			map.on('moveend', function() {
				mapService.setView(map.getCenter(),map.getZoom());
			});
			
			//if(mapService.getSelectedMarker()) {
				//mapService.getSelectedMarker().getPopup().openOn(map);
			//}
		}
		
		//USER LOCATION
		scope.$on('locate', function() {
			if(attrs.class==="map-sm") {
				map.locate({setView: false, watch: true});
			}
		});
		
		scope.$on('stopLocate', function() {
			map.stopLocate();
		});
		
		var uLoc;
		function onLocationFound(e) {
			
			var uPopup = L.popup({closeButton: false, autoPanPadding: L.point(5,60), className: 'popup'})
				.setContent("<strong>Votre position</strong>");
				
			if(map.hasLayer(uLoc)) {
				map.removeLayer(uLoc);
			} else {
				var z = (map.getZoom() < 14 ? 14 : map.getZoom());
				map.flyTo(e.latlng, z)
			}		
			uLoc = L.marker(e.latlng, {icon: redIcon}).addTo(map)
				.bindPopup(uPopup);
			
			//if(mapService.getView().center) {
				//var bounds = map.getBounds();
				//if(!bounds.contains(e.latlng)) {
					////var z = (map.getZoom() < 14 ? 14 : map.getZoom());
					//map.flyTo(e.latlng, map.getZoom());
				//}
			//} else {
				////var z = (map.getZoom() < 14 ? 14 : map.getZoom());
				//map.flyTo(e.latlng, map.getZoom())
			//}
		}
		
		function onLocationError(e) {
			alert(e.message);
		}
		
			
		
		
		map.on('locationfound', onLocationFound);
		map.on('locationerror', onLocationError);
	};
	
	return {
		restrict: 'AE',
		link: initialize,
	}
}]);

//main module
var main = angular.module('app.main', []);

main.component('main', {
	templateUrl: '/fragments/main/main',
	controller: ['$scope', '$http', '$location', '$route', 'authService', 'mapService', function($scope, $http, $location, $route, authService, mapService) {
			var ctrl = this;
			ctrl.home = false;
			ctrl.view = 'list';
			ctrl.placeview = 'text';
			//ctrl.loggedIn = false;
			ctrl.currentuser = null;
			ctrl.markers = {};
			//INIT APP
			ctrl.appInit = function () {
				ctrl.getUser();
				//ctrl.getMarkers();
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
			$scope.$on('refreshUser', function(event, data) {
				//ctrl.loggedIn = user.loggedIn;
				ctrl.currentuser = data.user;
				ctrl.admin = (ctrl.currentuser && ctrl.currentuser.role==="ADMIN") ? true : false;
			});
			//log out
			ctrl.signout = function() {
				$http.get('/users/signout').
					then(function(response) {
						ctrl.getUser();
						mapService.setView(null, null);
						$location.path('/');
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
			
			//log-in and menu
			ctrl.modalLoad = function(template) {
				ctrl.template = template;
				$("#myModal").modal({show: true});
			}
			//place infos when map-sm
			ctrl.placeModalLoad = function(template) {
				ctrl.placetemplate = template;
				$("#placeModal").modal({show: true});
			}
			//map-sm : launched by mapService (when click on popup) 
			$scope.$on('placeModal', function(ev, data) {
				ctrl.placeModalLoad('place');
			});
			
			$scope.$on('$routeChangeSuccess', function(event, current, previous) {
				//buttons toggleView and sort-by : display or not
				ctrl.views();
				//css classes for page Home
				ctrl.home = ( $location.path()==='/' ? true : false );
				if(ctrl.home) {
					ctrl.view="list";
					$('html').css("background-color", "#43a047");
				} else {
					$('html').css("background-color", "#fff");
				}
			});
			
			//TOGGLE VIEWS
			//menus button for toggleView and sort-by
			ctrl.views = function() {
				if($location.path()==='/places' || ($route.current.params.game && !$route.current.params.name)) {
					ctrl.btnViews = true;
					ctrl.hideSort = (ctrl.view==='map' ? true : false);
				} else {
					ctrl.btnViews = false;
					ctrl.hideSort = true;
				}
			}
			//toggleView()
			ctrl.toggleView = function() {
				ctrl.view = (ctrl.view==='list' ? 'map' : 'list');
				//if(ctrl.view==='map') {
					//ctrl.placeview = 'text';
				//}
				ctrl.hideSort = (ctrl.view==='map' ? true : false);
				//ctrl.hideLocate = (ctrl.view==='map' ? false : true);
				mapService.setView(null,null);
				mapService.stopLocate();
				//mapService.setSelectedMarker(null);
			}
			
			//placeToggleView()
			ctrl.placeToggleView = function() {
				ctrl.placeview = (ctrl.placeview==='text' ? ctrl.placeview = 'map' : ctrl.placeview = 'text');
			}
			//on placeToggleView from map to placeText
			$scope.$on('backToText', function(event,data) {
				$scope.$apply(function() {
					ctrl.placeToggleView();
				});
			});
			
			//on placeToggleView from map to placesList
			$scope.$on('goToMap', function(event,data) {
				ctrl.placeToggleView();
			});
			
			
			$(window).on('resize', function() {
				if(window.innerWidth >= 768) {
					$scope.$apply(function() {
						ctrl.view='list';
						ctrl.placeView='text';
					});
				 }
			});
			
			//places-list : scroll to place
			$scope.$on('item', function(ev,data) {
				mapService.scroll(data);
			});
			
			//locate
			ctrl.locate = function() {
				mapService.locate();
			}
			
			
	}]
});

main.component('home', {
		templateUrl: '/fragments/main/home',
		bindings: {
			maintitle: '=',
			markers: '=',
			template: '=',
		},
		controller: ['$http', '$location', function($http, $location) {
			
			var ctrl = this;
			ctrl.maintitle = '';
			
			ctrl.getGames = function() {
				$http.get('/api/games').
					then(function(response) {
						 ctrl.games = response.data;
					});
				};
				
			ctrl.getPlaces = function() {
			$http.get('/api/places').
				then(function(response) {
					ctrl.spots = response.data;
					ctrl.markers = ctrl.spots;
				});
			};
			ctrl.getPlaces();
			
			ctrl.goToPlaces = function(game) {
				if(game) {
					$location.path('/places/game/' + game);
				} else {
					$location.path('/places');
				}
			}
			
			//ctrl.modalLoad = function(template) {
				//ctrl.template = template;
				//$("#myModal").modal({show: true});
			//}
			
		}]
});

main.component('admin', {
		templateUrl: '/fragments/admin/admin'
});

main.component('menuSm', {
		templateUrl: '/fragments/main/menu',
		bindings: {
			maintitle: '=',
			template: '=',
			onCompleted: '&',
			currentuser: '<'
		},
		controller: ['$scope', 'mapService', function($scope, mapService) {
			
			var ctrl = this;
			ctrl.maintitle = "Menu";
			
			ctrl.close = function() {
				//mapService.setView(null,null);
				//mapService.setSelectedMarker(null);
				ctrl.onCompleted({action: "hide"});
			};
			
			ctrl.signout = function() {
				$scope.$emit('signout');
				ctrl.onCompleted({action: "hide"});
			}
		}]
});

main.component('modal', {
	templateUrl: '/fragments/main/modal',
	bindings: {
		template: '=',
		currentuser: '<'
	},
	controller: function($scope) {
		
		var ctrl = this;
		ctrl.modal = 'main';
		ctrl.maintitle = "";
		
		ctrl.close = function(action) {
			$("#myModal").modal(action);
		};
	}
});

main.component('modalPlace', {
	templateUrl: '/fragments/places/modal',
	bindings: {
		placetemplate: '=',
		currentuser: '<'
	},
	controller: function($scope, $http, $sce, toHtmlFilter) {
		
		var ctrl = this;
		ctrl.modal = 'place';
		ctrl.maintitle = "";
		
		ctrl.getPlace = function(name) {
			$http.get('/api/places/' + name).
				then(function(response) {
					ctrl.spot = response.data;
					return ctrl.spot;
				})
				.then(function(spot) {
					$http.get('/api/comments/place/' + spot._id).
						then(function(response) {
							ctrl.comments = response.data;
							ctrl.comments.forEach(function(comment) {
								comment.text = $sce.trustAsHtml(toHtmlFilter(comment.text));
								
							});
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
				});
		};
		
		$scope.$on('placeModal', function(ev, data) {
				ctrl.getPlace(data.place);
		});
			
		$("#placeModal").on('hidden.bs.modal', function() {
				ctrl.spot = {};
				ctrl.comments = {};
		});
		
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
				var left = w/2-(barW/2)-10;
				$(element).css("left", left+"px");
				/*on resize*/
				$(window).on('resize', function() {
					var w = $('.rightCol').width();
					var barW = $('#game-bar').width();//bar width
					var left = w/2-(barW/2)-10;
					$(element).css("left", left+"px");
				});
				
				
				scope.isActive = function(game) {
					if(game==='tous' && !$route.current.params.game) return true;
					return game===$route.current.params.game;
				};
				
				scope.isActiveOthers = function() {
					var game = $route.current.params.game;
					if(game==='board-game' | game==='bowling' | game==='jeu-video' | game==='petanque' | game==='ping-pong' ) return true;
				};
			}
		};
		
});

main.directive('gameDropDown', function($route, mapService) {
	
	return {
		templateUrl: '/fragments/main/gameDropDown',
		restrict: 'E',
		link: function(scope, element, attrs) {
						
			scope.$watch(attrs.game, function(newGame, oldGame) {
				scope.game = newGame;
			});
			
			scope.isActive = function(game) {
				if(game==='tous' && !$route.current.params.game) {
					return true;
				} else {
					return game===$route.current.params.game;
				}
			};
			
			scope.onChange = function() {
				//mapService.setSelectedMarker(null);
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
		placeview: '=',
		maintitle: '=',
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
			
			ctrl.placeview = 'text';
		};
		
		ctrl.getPlaces = function() {
			$http.get('/api/places').
				then(function(response) {
					ctrl.spots = response.data;
					ctrl.markers = ctrl.spots;
					ctrl.maintitle = 'Tous les bars';
				});
		};
		
		ctrl.getGamePlaces = function() {
			$http.get('/api/games/' + $route.current.params.game).
				then(function(response) {
					ctrl.game = response.data;
					ctrl.maintitle = ctrl.game.name;
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
		
		
		
	}
});

places.component('placesList', {
	templateUrl: '/fragments/places/placesList',
	bindings: {
		spots: '<',
		maintitle: '<',
		link: '<'
	},
	controller: function($rootScope, $scope, $http, $location, mapService, sortService, $filter) {
		var ctrl = this;
		
		//sort for mobile (broadcast from sortService). Otherwise : bindings in sortBy
		$scope.$on('sortProperty', function(event, data) {
			ctrl.propertyName = data.property;
		});
		$scope.$on('sortOrder', function(event, data) {
			ctrl.reverse = data.reverse;
		});
		
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
		maintitle: '='
	},
	controller: function($route, $http, mapService, $sce, toHtmlFilter, $location) {
		
		var ctrl = this;
		ctrl.ready = false;
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
					ctrl.maintitle = 'Tous les bars';
					ctrl.spot = ctrl.getPlace(ctrl.spots);
					ctrl.ready = true;
					ctrl.comments = ctrl.getComments(ctrl.spot._id)
				});
		};
		
		ctrl.getGamePlaces = function() {
			$http.get('/api/games/' + $route.current.params.game).
				then(function(response) {
					ctrl.game = response.data;
					ctrl.maintitle = ctrl.game.name;
					return ctrl.game;
				})
				.then(function(game) {
					$http.get('/api/places/game/'  + game._id).
						then(function(response) {
							ctrl.spots = response.data;
							ctrl.markers = ctrl.spots;
							ctrl.spot = ctrl.getPlace(ctrl.spots);
							ctrl.ready = true;
							ctrl.comments = ctrl.getComments(ctrl.spot._id)
						});
				});
		};
		ctrl.commentsTitle = "";
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
	controller: function($route, mapService, $location) {
		
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


places.component('placeModal', {
	templateUrl: '/fragments/places/placeModal',
	bindings: {
		placetemplate: "=",
		spot: "<",
		comments: "=",
		currentuser: "<",
		maintitle: "="
	},
	controller: function() {
		
		var ctrl = this;
		ctrl.maintitle = null;
		ctrl.addComment = function() {
			if(!ctrl.currentuser) {
				ctrl.placetemplate = 'sign-in';
				return
			}
			ctrl.placetemplate = 'comment';
		};
		
	}
});

places.component('placesAdmin', {
	templateUrl: '/fragments/places/placesAdmin',
	bindings: {
		markers: '='
	},
	controller: function($scope, $http, $location, mapService) {
		
		var ctrl = this;
		ctrl.path = $location.path();
		//sort for mobile (broadcast from sortService). Otherwise : bindings in sortBy
		$scope.$on('sortProperty', function(event, data) {
			ctrl.propertyName = data.property;
		});
		$scope.$on('sortOrder', function(event, data) {
			ctrl.reverse = data.reverse;
		});
		
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
		
		//marker in view and popup open
		ctrl.goToPlace = function(spot) {
			$location.path('/admin/places/name/' + spot.nameAlpha + '/show');
			$scope.$emit('position', {index: ctrl.spots.indexOf(spot), lat: spot.lat, lg: spot.lg});
		}
		
		//scroll to place
		$scope.$on('item', function(ev,data) {
			mapService.scroll(data);
		});
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
		};
		
		ctrl.getPlace = function() {
			$http.get('/api/places/'  + $route.current.params.name).
				then(function(response) {
					ctrl.spot = response.data;
					ctrl.spot.description = $sce.trustAsHtml(toHtmlFilter(ctrl.spot.description));
					ctrl.getComments(ctrl.spot._id)
				});
		};
		
		ctrl.back = function() {
			mapService.setScrollPosition('/admin/places', ctrl.spot._id);
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
		propertyName: '=',
		reverse: '='
	},
	controller: function($rootScope, $scope, sortService) {
		
		var ctrl = this;
		
		ctrl.propertyName = sortService.getPropertyName();
		ctrl.reverse = sortService.getReverse();
		
		ctrl.sortBy = function(name) {
			ctrl.propertyName = name;
			sortService.setPropertyName(ctrl.propertyName);
		}
		
		ctrl.toggleReverse = function() {
			ctrl.reverse = (ctrl.reverse===true ? false: true);
			sortService.setReverse(ctrl.reverse);
		}
		
		ctrl.labels = {
			nameAlpha: 'nom',
			cp: 'code postal',
			updated: 'date de mise à jour'
		}
	}
});

//filter line breaks to <br>
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
				ctrl.onAnonymous({ template: 'sign-in' });
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

comments.component('newCommentModal', {
	templateUrl: '/fragments/comments/newModal',
	bindings: {
		placetemplate: "=",
		spot: "<",
		comments: "=",
		currentuser: '<',
		onCompleted: '&',
		maintitle: "="
	},
	controller: function($scope, $http, $sce, toHtmlFilter) {
		
		var ctrl = this;
		ctrl.maintitle = '';
		ctrl.form = {};
		ctrl.comment = {};
				
		ctrl.add = function() {
			if(!ctrl.currentuser) {
				ctrl.placetemplate = 'sign-in';
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
						ctrl.placetemplate = 'place';
						ctrl.onCompleted({ id: ctrl.spot._id});
					}
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
		maintitle: '=',
		template: '=',
		onCompleted: '&',
		modal: '<'
	},
	controller: function($scope, $http, $location,authService) {
		var ctrl = this;
		ctrl.maintitle = "Inscription";
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
					} else if(response.data.loggedIn===true) {
						authService.getUser().then(function(user) {
							$scope.$emit('refreshUser', user);
							if(ctrl.user.remember) {
								authService.remember();
							}
							ctrl.user = {};
						    ctrl.form = {};
							if(ctrl.modal==="place") {
								ctrl.template='comment';
							} else {
								ctrl.onCompleted({action: "hide"});
							}
						});
					}
				});
		};
		
	}
});

users.component('signIn', {
	templateUrl: '/fragments/users/signIn',
	bindings: {
		maintitle: '=',
		template: '=',
		onCompleted: '&',
		modal: '<'
	},
	controller: function($scope, $http, $location, $route, authService) {
		
		var ctrl = this;
		ctrl.maintitle = "Connexion";
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
					} else if(response.data.loggedIn===true) {
						authService.getUser().then(function(user) {
							$scope.$emit('refreshUser', user);
							if(ctrl.user.remember) {
								authService.remember();
							}
							ctrl.user = {};
							ctrl.form = {};
							if(ctrl.modal==="place") {
								ctrl.template='comment';
							} else {
								ctrl.onCompleted({action: "hide"});
							}
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
		maintitle: '=',
		template: '=',
		onCompleted: '&'
	},
	controller: function($scope) {
		var ctrl = this;
		ctrl.maintitle = "Profil";
		ctrl.admin = false;
		
		if(ctrl.currentuser.role==="ADMIN") {
			ctrl.admin = true;
		}
		
		ctrl.close = function() {
			ctrl.onCompleted({action: "hide"});
		}
		
		ctrl.signout = function() {
			$scope.$emit('signout');
			ctrl.onCompleted({action: "hide"});
		}
		
	}
});

users.component('resetPassword', {
	templateUrl: '/fragments/users/resetPassword',
	bindings: {
		currentuser: '<',
		maintitle: '=',
		template: '='
	},
	controller: function($http, authService) {
		var ctrl = this;
		ctrl.maintitle = "Modifier votre mot de passe";
		ctrl.user = {};
		ctrl.form = {};
				
		ctrl.resetPassword = function() {
			ctrl.user.email = ctrl.currentuser.email;
			$http.put('/users/resetPassword', ctrl.user).
				then(function(response) {
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
		maintitle: '=',
		template: '=',
	},
	controller: function($http) {
		
		var ctrl = this;
		ctrl.maintitle = 'Mot de passe oublié';
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
							ctrl.form.message = 'Désolé, votre demande n\'a pas pu aboutir. Veuillez recommencer.';
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
