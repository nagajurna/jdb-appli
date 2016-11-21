var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var bCrypt = require('bcrypt');
var base64url = require('base64url');

var requiredMessage = "Champ obligatoire";
var emailMatch = [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Adresse invalide"];
var passwordMin = [3, "Mot de passe trop court (3 lettres minimum)"];

var userSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: {	type: String, required: requiredMessage },
	email: { type: String, required: requiredMessage, match: emailMatch },
	password: { type: String, required: requiredMessage, minlength: passwordMin },
	role: { type: String, required: requiredMessage },
	token: { type: String }
});

userSchema.add({ token_created_at: Date, remember_token: String });

userSchema.statics.createHash = function(string) {
	 return bCrypt.hashSync(string, bCrypt.genSaltSync(10), null);
};

userSchema.methods.validPassword = function(user, string) {
	 return bCrypt.compareSync(string, user.password);
};

userSchema.statics.rememberToken = function() {
	//create a token
	var token = base64url(crypto.randomBytes(64));
	//encrypt token
	var encryptedToken = bCrypt.hashSync(token, bCrypt.genSaltSync(10), null);
	//return both
	return { token: token, encryptedToken: encryptedToken };
}

userSchema.methods.validRememberToken = function(user, string) {
	 return bCrypt.compareSync(string, user.remember_token);
};

module.exports = mongoose.model('User', userSchema);
