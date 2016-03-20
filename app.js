/**
 * Webserver
 */
var express = require('express');
var app = express();
var routes = require('./modules/routes'); //route handling logic
var port = 3000;
//static web pages in 'static' physical folder are available under 'html' virtual folder
app.use('/html', express.static('static'));
//nothing available in root folder.
app.get('/', function (req, res) {
	res.status(403).send('Forbidden');
});
//start webserver
app.listen(port, function () {
	console.log('Lifestats app listening on port 3000!');
});
//enable webservices
app.get('/ws/rtpi/:stopid', routes.RTPIData);
app.get('/ws/traffic/:setupid', routes.TrafficStats);