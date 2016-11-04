var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var requiredMessage = "Champ obligatoire";

var placeSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: {	type: String, required: requiredMessage},
	nameAlpha: { type: String, required: requiredMessage, lowercase: true }, 
	address: { type: String, required: requiredMessage },
	cp: { type: String, required: requiredMessage },
	city: {	type: String, required: requiredMessage },
	tel: String,
	horaires: String,
	description: String,
	games: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
	lat: { type: Number, required: requiredMessage },
	lg: { type: Number, required: requiredMessage },
	visible: { type: Boolean, default: false },
	updated: { type: Date, default: Date.now },
})


module.exports = mongoose.model('Place', placeSchema);
