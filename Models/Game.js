var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameSchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: {	type: String, required: 'Champ obligatoire' },
	pathname: { type: String, required: 'Champ obligatoire' }
})

module.exports = mongoose.model('Game', gameSchema);
