var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bCrypt = require('bcrypt');

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

userSchema.statics.createHash = function(password) {
	 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

userSchema.methods.validPassword = function(user, password) {
	 return bCrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', userSchema);
