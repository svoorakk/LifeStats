var express = require('express');
var app = express();
var routes = require('./modules/routes');

app.use('/html', express.static('static'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.get('/ws/rtpi/:stopid', routes.RTPIData);
app.get('/ws/traffic/:setupid', routes.TrafficStats);