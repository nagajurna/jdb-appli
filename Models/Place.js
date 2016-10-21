var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var placeSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: {	type: String, required: true},
	nameAlpha: { type: String, required: true, lowercase: true }, 
	address: { type: String, required: true },
	cp: { type: String, required: true },
	city: {	type: String, required: true },
	tel: String,
	horaires: String,
	description: String,
	games: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
	lat: Number,
	lg: Number,
	visible: { type: Boolean, default: false },
	updated: { type: Date, default: Date.now },
})


module.exports = mongoose.model('Place', placeSchema);
