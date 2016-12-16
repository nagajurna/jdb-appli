var express = require('express');
var crypto = require('crypto');
var base64url = require('base64url');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	//generate token for XSRF-TOKEN
	var token = base64url(crypto.randomBytes(64));
	res.cookie('XSRF-TOKEN', token);
	//render index
	res.render('index', {title: "JDB"});
	//res.status('200').sendFile('index', {root: 'public/views/'});
});

router.get('/xsrf', function(req, res, next) {
	var token = req.cookie('XSRF-TOKEN');
	return res.json({token: token});
});

/* GET fragments files. */
//router.get('/fragments/:filename', function(req, res, next) {
	//console.log('ok');
	//var filename = req.params.filename;
	//res.render('fragments/' + filename);
	////res.status('200').sendFile(filename, {root: 'public/views/fragments/'});
//});

/* GET fragments files in repertory. */
router.get('/fragments/:repertory/:filename', function(req, res, next) {
	var repertory = req.params.repertory;
	var filename = req.params.filename;
	res.render('fragments/' + repertory + '/' + filename);
});



module.exports = router;
