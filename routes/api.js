var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');

var mongoose = require('mongoose');

var Game = require('../Models/Game');
var Place = require('../Models/Place');


/* GET games */
router.get('/games', function(req, res, next) {
	Game.find({}, function(err,docs) {
		if(err) return console.log(err);
		res.json(docs);
		});
});


/* POST addGame */
router.post('/games/add', function(req, res, next) {
	var game = new Game({name: req.body.name, 
						pathname: req.body.pathname, 
						_id: new mongoose.Types.ObjectId});
	game.save(function(err) {
		if(err) {
			console.log(err);
			res.json(err);
		} else {
		res.json('ok');
		console.log(game);}
		});
});

/* GET  game */
router.get('/game/:pathname', function(req, res, next) {
	var pathname = req.params.pathname;
	Game.findOne({pathname: pathname}, function(err, doc) {
		if(err) return console.log(err);
		res.json(doc);
		});
});

/* PUT  game */
router.put('/games/update/:id', function(req, res, next) {
	var id = req.params.id;
	Game.findOne({ _id: id }, function(err, game) {
		if(err) return console.log(err);
		game.name = req.body.name;
		game.pathname = req.body.pathname;
		game.save(function(err) {
			if(err) return console.log(err);
			res.json(game);
			});
	});
	
});

/* DELETE game */
router.delete('/games/delete/:id', function(req, res, next) {
	var id = req.params.id;
	Game.remove({_id: id }, function(err) {
		if(err) return console.log(err);
		res.json('ok');
	});
});


/* GET places */
router.get('/places', function(req, res, next) {
	Place
	.find()
	.sort('nameAlpha')
	.populate('games')
	.exec(function(err,docs) {
		if(err) return console.log(err);
		res.json(docs);
		});
});

/* GET places/game */
router.get('/places/game/:name', function(req, res, next) {
	var name = req.params.name;
	Game.findOne({pathname: name}, function(err, game) {
		if(err) return console.log(err);
		Place
		.find({ games: game._id })
		.sort('nameAlpha')
		.populate('games')
		.exec(function(err,places) {
			if(err) return console.log(err);
			res.json(places);
			});
		
	});
	
	
});

/* POST addPlace */
router.post('/places/add', function(req, res, next) {
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
router.put('/places/update/:id', function(req, res, next) {
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
			if(err) return console.log(err);
			res.json(place);
			});
	});
	
});

/* DELETE place */
router.delete('/places/delete/:id', function(req, res, next) {
	var id = req.params.id;
	Place.remove({_id: id }, function(err) {
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
