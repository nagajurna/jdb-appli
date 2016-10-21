var mongoose = require('mongoose');
var User = require('../Models/User');
var LocalStrategy   = require('passport-local').Strategy;
var passport = require('passport');
	
//config sessions
passport.serializeUser(function(user, done) {
	console.log('serializing user: ', user);
   done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	User.findOne({ _id: id }, function(err, user) {
		console.log('deserializing user:',user);
		done(err, user);
	});
});

//strategy for signup
passport.use('signup', new LocalStrategy({
		passReqToCallback : true,// allows us to pass back the entire request to the callback
		usernameField: 'name' 
	},
	function(req, username, password, done) {
		
		findOrCreateUser = function() {
			User.findOne({ name :  username }, function(err, user) {// find a user in Mongo with provided username
				
				if (err) { return done(err); }// In case of any error, return using the done method
				
				if (user) { 
					var reason = {};
					reason.name = 'AuthentificationError';
					reason.message = 'nom d\'utilisateur déjà enregistré';
					return done(null, false, { loggedIn: false, reason: reason });
					}// mail already exists
					
					User.findOne({ email :  req.body.email }, function(err, user) {// if ok no user with that email : check the name
							
							if (err) { return done(err); }// In case of any error, return using the done method
							
							if (user) { 
								var reason = {};
								reason.name = 'AuthentificationError';
								reason.message = 'adresse mail déjà enregistrée';
								return done(null, false, { loggedIn: false, reason: reason });
								}// name already exists
							
							var newUser = new User({name: username, // if ok no user with that name : create the user
								password: User.createHash(password),
								email: req.body.email,
								role: 'USER',
								_id: new mongoose.Types.ObjectId});
							
							newUser.save(function(err) {// save the user
								if(err) {
									return done(null, false, {loggedIn: false, reason: err});
								} else {
									return done(null, newUser);}
							});
					});
			});
		};
		// Delay the execution of findOrCreateUser and execute the method in the next tick of the event loop
		process.nextTick(findOrCreateUser);
	})
);

//strategy for signin
passport.use('signin', new LocalStrategy({
		passReqToCallback : true,// allows us to pass back the entire request to the callback
		usernameField: 'email' 
	},
	function(req, email, password, done) {
		User.findOne({ email: email }, function (err, user) {
			
		  if (err) { return done(err); }
		  
		  if (!user) { 
			  var reason = {};
			  reason.name = 'AuthentificationError';
			  reason.message = 'mauvaise combinaison identifiant/mot de passe';
			  return done(null, false, { loggedIn: false, reason: reason }); 
		  }
		  
		  if (!user.validPassword(user, password)) { 
			  var reason = {};
			  reason.name = 'AuthentificationError';
			  reason.message = 'mauvaise combinaison identifiant/mot de passe';
			  return done(null, false, { loggedIn: false, reason: reason });  
		  }
		  
		  return done(null, user);
		});
  }
));

//strategy for reset password
passport.use('resetPassword', new LocalStrategy({
		passReqToCallback : true,// allows us to pass back the entire request to the callback
		usernameField: 'email',
		passwordField: 'passwordCurrent'
	},
	function(req, email, password, done) {
		User.findOne({ email: email }, function (err, user) {
			
		  if (err) { return done(err); }
		  
		  if (!user) { 
			  var reason = {};
			  reason.name = 'AuthentificationError';
			  reason.message = 'user.email.invalid';
			  return done(null, false, { reset: false, reason: reason }); 
		  }
		  
		  if (!user.validPassword(user, password)) { 
			  var reason = {};
			  reason.name = 'AuthentificationError';
			  reason.message = 'user.password.invalid';
			  return done(null, false, { reset: false, reason: reason }); 
		  }
		  
		  user.password = User.createHash(req.body.password);
		  user.save(function(err) {
			  if(err) {
				  return console.log(err);
				  return done(err);
			  } else {
				  console.log('password changed');
				  return done(null, user); 
			  }
		  });
		  
		 
		 
		});
  }
));

