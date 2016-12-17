var express = require('express');
var crypto = require('crypto');
var base64url = require('base64url');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
	//render index
	res.render('index', {title: "JDB"});
});

/* GET fragments files in repertory. */
router.get('/fragments/:repertory/:filename', function(req, res, next) {
	var repertory = req.params.repertory;
	var filename = req.params.filename;
	res.render('fragments/' + repertory + '/' + filename);
});



module.exports = router;
