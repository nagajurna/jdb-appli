var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var base64url = require('base64url');
var nodemailer = require('nodemailer');
var Entities = require('html-entities').XmlEntities;
//var infos = require('jdb-infos');

var mongoose = require('mongoose');
var User = require('../Models/User');

var passport = require('passport');

var xsrfCheck = function(req, res, next) {
	if(req.headers['x-xsrf-token'] !== req.cookies['XSRF-TOKEN']) { 
		return res.json({xsrfAlert: true, message: 'req.not.valid'}); 
	}
	
	next();
};

var credentialsPreCheck = function(req, res, next) {
	
	if(req.path === '/signup') {
		   var valUser = new User({name: req.body.name,
								email: req.body.email,
								password: req.body.password});
		var valError = {};
		valError = valUser.validateSync();
		if(!req.body.passwordConfirm) { 
			valError.errors.passwordConfirm = {} ; valError.errors.passwordConfirm.message = 'Champ obligatoire';
		} else if(req.body.passwordConfirm !== req.body.password) { 
			valError.errors.passwordConfirm = {} ; valError.errors.passwordConfirm.message = 'Mot de passe différent';
		}
		if(valError.errors.name || valError.errors.email || valError.errors.password  || valError.errors.passwordConfirm) {
			valError.name = 'ValidationError';
			return res.json({loggedIn: false, reason: valError});
		}
	} else if(req.path === '/signin') {
		var valError = {};
		valError.errors = {};
		if(!req.body.email) { valError.errors.email = {} ; valError.errors.email.message = 'Champ obligatoire';}
		if(!req.body.password) { valError.errors.password = {} ; valError.errors.password.message = 'Champ obligatoire';}
		if( valError.errors.email || valError.errors.password ) {
			valError.name = 'ValidationError';
			return res.json({loggedIn: false, reason: valError});
		} 
	} else if(req.path === '/resetPassword') {
		var valUser = new User({password: req.body.password});
		var valError = {};
		valError = valUser.validateSync();
		if(!req.body.passwordCurrent) { valError.errors.passwordCurrent = {} ; valError.errors.passwordCurrent.message = 'Champ obligatoire';}
		if(!req.body.passwordConfirm) { 
			valError.errors.passwordConfirm = {} ; valError.errors.passwordConfirm.message = 'Champ obligatoire';
		} else if(req.body.passwordConfirm !== req.body.password) { 
			valError.errors.passwordConfirm = {} ; valError.errors.passwordConfirm.message = 'Mot de passe différent';
		}
		if( valError.errors.passwordCurrent || valError.errors.password  || valError.errors.passwordConfirm ) {
			return res.json({reset: false, reason: valError});
		}
	} else if(req.path === '/forgotPassword') {
		var valError = {};
		valError.errors = {};
		if(!req.body.email) { valError.errors.email = {} ; valError.errors.email.message = 'Champ obligatoire';}
		if( valError.errors.email) {
			valError.name = 'ValidationError';
			return res.json({mailSent: false, reason: valError});
		} 
	} else if(req.path === '/forgotPassword/reset') {
		var valUser = new User({password: req.body.password});
		var valError = {};
		valError = valUser.validateSync();
		if(!req.body.passwordConfirm) { 
			valError.errors.passwordConfirm = {} ; valError.errors.passwordConfirm.message = 'Champ obligatoire';
		} else if(req.body.passwordConfirm !== req.body.password) { 
			valError.errors.passwordConfirm = {} ; valError.errors.passwordConfirm.message = 'Mot de passe différent';
		}
		if( valError.errors.password  || valError.errors.passwordConfirm ) {
			return res.json({reset: false, reason: valError});
		}
	}
		
	next();
}

router.post('/signup', [xsrfCheck,credentialsPreCheck], function(req, res, next) {
	
	passport.authenticate('signup', function(err, user, info) {
		if (err) { return next(err); }
		
		if (!user) { return res.json(info); }
		
		req.logIn(user, function(err) {
			
		  if (err) { return next(err); }
		  entities = new Entities();
		  var currentUser = {};
		  currentUser.id = req.user._id;
		  currentUser.name = entities.encode(req.user.name);
		  currentUser.email = req.user.email;
		  currentUser.role = req.user.role;
		  res.set('Cache-Control', 'no-cache, no-store, must-revalidate'); 
		  return res.json({ loggedIn: true, user: currentUser });
		});
	  })(req, res, next);
});
	
router.post('/signin', [xsrfCheck,credentialsPreCheck], function(req, res, next) {
	
	passport.authenticate('signin', function(err, user, info) {
		if (err) { return next(err); }
		
		if (!user) { return res.json(info); }
		
		req.logIn(user, function(err) {
			
		  if (err) { return next(err); }
		  var currentUser = {};
		  currentUser.id = req.user._id;
		  currentUser.name = req.user.name;
		  currentUser.email = req.user.email;
		  currentUser.role = req.user.role;
		  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		  return res.json({loggedIn: true, user: currentUser });
		});
	  })(req, res, next);
});
	
router.put('/resetPassword', [xsrfCheck,credentialsPreCheck], function(req, res, next) {
	
	passport.authenticate('resetPassword', function(err, user, info) {
		if (err) { return next(err); }
		
		if (!user) { return res.json(info); }
		res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		return res.json({reset: true, message: 'Votre mot de passe a été modifié' });
		
	  })(req, res, next);
});

router.post('/forgotPassword', [xsrfCheck,credentialsPreCheck], function(req, res, next) {
	
	User.findOne({email :  req.body.email }, function(err, user) {
		if(err) {
			return res.json({mailSent: false, reason: err});
		}
		if(!user) {
			var error = {};
			error.name = 'AuthentificationError';
			error.message = 'cette adresse n\'est pas enregistrée';
			return res.json({mailSent: false, reason: error});
		}
		//créer token
		var token = base64url(crypto.randomBytes(64));
		user.token = token;
		//enregistrer token
		user.save(function(err) {
			if(err) {
				console.log(err);
				return res.json({mailSent: false, reason: err});
			}
			//envoyer email
			var transporter = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: process.env.MAIL_ADDRESS, // votre adresse mail
					pass: process.env.MAIL_PASSWORD // mot de passe
				}
			});
			var htmlMessage = '<p>' + user.name + ', cliquez sur ce lien suivant afin de créer un nouveau mot de passe :</p>' +
							  '<p><a href="http://localhost:3000/#/forgotPassword/reset?mail=' + user.email + '&token=' + user.token + '">créer un nouveau mot de passe</a></p>'
			var mailOptions = {
				from: '<' + process.env.MAIL_ADDRESS + '>', // expéditeur
				to: process.env.MAIL_ADDRESS, // destinataire
				subject: 'Reset Password',
				html: htmlMessage
			};
			transporter.sendMail(mailOptions, function(error, info){
				if(error){
					//console.log(error);
					return res.json({mailSent: false, reason: error});
				} else {
					var message = "Un mail a été envoyé à l'adresse suivante : " + req.body.email;
					return res.json({mailSent: true, message: message });
				}
			});
			
		});
		
		
	});	
	 
});

router.put('/forgotPassword/reset', [xsrfCheck,credentialsPreCheck], function(req, res, next) {
	console.log(req.body);
	User.findOne({email :  req.body.email }, function(err, user) {
		if(err) {
			console.log(err);
			return res.json({reset: false, reason: err});
		}
		if(!user) {
			var error = {};
			error.name = 'AuthentificationError';
			error.message = 'cette adresse n\'est pas enregistrée';
			return res.json({reset: false, reason: error});
		}
		if(req.body.token !== user.token) {
			var error = {};
			error.name = 'AuthentificationError';
			error.message = 'ce jeton n\'est pas valable';
			return res.json({reset: false, reason: error});
		}
		 user.password = User.createHash(req.body.password);
		 user.token = '';
		 user.save(function(err) {
			if(err) {
			  console.log(err);
			  return res.json({reset: false, reason: err});
			} else {
			  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
			  return res.json({reset: true, message: 'Votre mot de passe a été modifié'});
			}
		 });
		
	});
});
	
router.get('/signout', function(req, res){
  req.logout();
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.json({loggedIn: false, user: null});
});

router.get('/check', function(req, res){
	if(req.isAuthenticated()) {
	  var currentUser = {};
	  currentUser.id = req.user._id;
	  currentUser.name = req.user.name;
	  currentUser.email = req.user.email;
	  currentUser.role = req.user.role;
	  res.set('Cache-Control', 'no-cache, no-store, must-revalidate'); 
	  return res.json({ loggedIn: true, user: currentUser }) 
	} else {
	  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
	  return res.json({ loggedIn: false, user: null });
	}
});



module.exports = router;

