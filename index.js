var express = require('express');

var fs = require('fs');

var app = express();

app.use(express.static('public'));

app.get('/', function(req, res){
	res.sendfile('public/index.html');
});

app.get('/play', function(req, res){
	res.sendfile('public/play.html');
});

app.get('/randomBackground', function(req, res){
	fs.readdir('public/background', function(error, files){
		if (error){
			res.status(500);
		} else {
			res.sendfile('public/background/' + files[Math.floor(Math.random()*files.length)]);
		}
	});
});

app.listen(80, function(){
	console.log('Serve is listening');
});



