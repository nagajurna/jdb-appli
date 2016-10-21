var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: {	type: String, required: true },
	pathname: { type: String, required: true }
})

module.exports = mongoose.model('Game', gameSchema);
