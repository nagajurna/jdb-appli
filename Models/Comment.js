var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
	_id: Schema.Types.ObjectId,
	text: { type: String, required: 'Veuillez écrire votre commentaire.' },
	visible: { type: Boolean, default: true },
	postedAt: { type: Date, default: Date.now },
	author: { type: Schema.Types.ObjectId, ref: 'User' },
	place: { type: Schema.Types.ObjectId, ref: 'Place' },
})


module.exports = mongoose.model('Comment', commentSchema);
