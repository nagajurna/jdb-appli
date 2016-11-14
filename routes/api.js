var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var Entities = require('html-entities').XmlEntities;

var mongoose = require('mongoose');

var Game = require('../Models/Game');
var Place = require('../Models/Place');
var Comment = require('../Models/Comment');


/* GET games */
router.get('/games', function(req, res, next) {
	
	Game
	.find()
	.sort({ pathname: 1 })
	.exec(function(err,games) {
			if(err) return console.log(err);
			res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
			res.json(games);
		});
});


/* POST addGame */
router.post('/games', function(req, res, next) {
	
	var game = new Game({name: req.body.name, 
						pathname: req.body.pathname, 
						_id: new mongoose.Types.ObjectId});
	
	game.save(function(err) {
		if(err) {
			res.json({saved: false, reason: err});
		} else {
			res.json({saved: true});
		}
	});
});

/* GET  game */
router.get('/games/:pathname', function(req, res, next) {
	
	var pathname = req.params.pathname;
	
	Game.findOne({pathname: pathname}, function(err, game) {
			if(err) return console.log(err);
			res.json(game);
		});
});

/* PUT  game */
router.put('/games/:id', function(req, res, next) {
	var id = req.params.id;
	Game.findOne({ _id: id }, function(err, game) {
		if(err) return console.log(err);
		game.name = req.body.name;
		game.pathname = req.body.pathname;
		game.save(function(err) {
				if(err) {
					console.log(err);
					res.json({saved: false, reason: err});
				} else {
					res.json({saved: true});
				}
			});
	});
	
});

/* DELETE game */
router.delete('/games/:id', function(req, res, next) {
	var id = req.params.id;
	Game.remove({_id: id }, function(err) {
			if(err) return console.log(err);
			res.json('ok');
		});
});


/* GET places */
router.get('/places', function(req, res, next) {
	Place
	.find({visible: true})
	.sort({ nameAlpha: 1 })
	.populate('games')
	.exec(function(err,places) {
		if(err) return console.log(err);
		res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.json(places);
		});
});

/* GET admin/places */
router.get('/places', function(req, res, next) {
	Place
	.find()
	.sort({ nameAlpha: 1 })
	.populate('games')
	.exec(function(err,places) {
		if(err) return console.log(err);
		res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.json(places);
		});
});

/* GET places/game */
router.get('/places/game/:id', function(req, res, next) {
	var id = req.params.id;
	Place
	.find({ games: id })
	.sort({ nameAlpha: 1 })
	.populate('games')
	.exec(function(err,places) {
			if(err) return console.log(err);
			res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
			res.json(places);
		});
});

/* POST addPlace */
router.post('/places', function(req, res, next) {
	var games = [];
	for (key in req.body.games) {
		if(req.body.games[key]===true) {
			games.push(mongoose.Types.ObjectId(key));
		}
	}
	var place = new Place({name: req.body.name, 
						   nameAlpha: req.body.nameAlpha,
						   address: req.body.address, 
						   cp: req.body.cp,
						   city: req.body.city,
						   tel: req.body.tel,
						   horaires: req.body.horaires,
						   description: req.body.description,
						   games: games,
						   lat: req.body.lat,
						   lg: req.body.lg,
						   visible: req.body.visible,
						   _id: new mongoose.Types.ObjectId});
	place.save(function(err) {
		if(err) {
			res.json({saved: false, reason: err});
		} else {
			res.json({saved: true});
		}
	});
});

/* GET  place */
router.get('/places/:name', function(req, res, next) {
	var name = req.params.name;
	Place
	.findOne({nameAlpha: name})
	.populate('games')
	.exec(function(err, place) {
			if(err) return console.log(err);
			res.json(place);
		});
});

/* PUT  place */
router.put('/places/:id', function(req, res, next) {
	var id = req.params.id;
	var games = [];
	for (key in req.body.games) {
		if(req.body.games[key]===true) {
			games.push(mongoose.Types.ObjectId(key));
		}
	}
	Place.findOne({ _id: id }, function(err, place) {
		if(err) return console.log(err);
		place.name = req.body.name;
	    place.nameAlpha = req.body.nameAlpha;
	    place.address = req.body.address; 
	    place.cp = req.body.cp;
	    place.city = req.body.city;
	    place.tel = req.body.tel;
	    place.horaires = req.body.horaires;
	    place.description = req.body.description;
	    place.games = games;
	    place.lat = req.body.lat;
	    place.lg = req.body.lg;
	    place.visible = req.body.visible;
	    place.updated = Date.now();
		
		place.save(function(err) {
			if(err) {
				res.json({saved: false, reason: err});
			} else {
				res.json({saved: true});
			}
		});
	});
	
});

/* DELETE place */
router.delete('/places/:id', function(req, res, next) {
	var id = req.params.id;
	Place.remove({_id: id }, function(err) {
		if(err) return console.log(err);
		res.json('ok');
	});
});

/* GET comments (for count) */
router.get('/comments', function(req, res, next) {
	Comment
	.find({visible: true})
	.select({ place: 1})
	.exec(function(err,comments) {
			if(err) return console.log(err);
			res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
			res.json(comments);
		});

});

/* GET comments/place */
router.get('/comments/place/:id', function(req, res, next) {
	var id = req.params.id;
	Comment
	.find({ place: id, visible: true })
	.sort({ postedAt: -1 })
	.populate({ path: 'author', select: 'name' })
	.exec(function(err,comments) {
			if(err) return console.log(err);
			res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
			res.json(comments);
		});

});
/* GET admin/comments/place */
router.get('/admin/comments/place/:id', function(req, res, next) {
	var id = req.params.id;
	Comment
	.find({ place: id })
	.sort({ postedAt: -1 })
	.populate('author')
	.exec(function(err,comments) {
			if(err) return console.log(err);
			res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
			res.json(comments);
		});

});

/* Add comment*/
router.post('/comments', function(req, res, next) {
	
	var entities = new Entities();
	var text;
	if(req.body.text) { 
		text = entities.encode(req.body.text);
	} else {
		text = req.body.text;
	}
	var comment = new Comment({text: text, 
							   author: mongoose.Types.ObjectId(req.body.author),
							   place: mongoose.Types.ObjectId(req.body.place), 
							   _id: new mongoose.Types.ObjectId});
	
	comment.save(function(err) {
		if(err) {
			res.json({saved: false, reason: err});
		} else {
			res.json({saved: true});
		}
	});


});

/* update comment (toggleVisible)*/
router.put('/comments/:id', function(req, res, next) {
	var id = req.params.id;
	var visible = req.body.visible;
	Comment.findOne({ _id: id }, function (err, comment) {
		  if (err) return console.log(err);
		    comment.visible = visible;
		  comment.save(function(err) {
			if(err) {
				console.log(err);
				res.json({saved: false, reason: err});
			} else {
				res.json({saved: true});
			}
		});
	});
});

/* Remove comment */
router.delete('/comments/:id', function(req, res, next) {
	var id = req.params.id;
	Comment.remove({_id: id }, function(err) {
			if(err) return console.log(err);
			res.json('ok');
		});
});

/*SET MARKERS*/
router.post('/markers', function(req, res, next) {
	req.session.markers = req.body.markers;
	res.json({message: 'markers enregistrés dans session'});
});

/*GET MARKERS*/
router.get('/markers', function(req, res, next) {
	if(req.session.markers) {
		var markers = req.session.markers;
		res.json({session: 'ok', markers: markers});
	}
	
});

module.exports = router;
