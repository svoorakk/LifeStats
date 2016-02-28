var request = require ("./httprequest").create();
var fs = require("fs");

request.get("https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid=7602&format=json", 
	function (err, body) {
		transformRTPI(body);
	});

var transformRTPI = function (json) {
	var RTPI = JSON.parse(json);
	var results = RTPI.results;
	var routes = {};
	results.forEach(function(itm) {
		if (!routes[itm.route]) {
			routes[itm.route] = [itm];
		}
		else {
			arr = routes[itm.route];
			arr.push(itm);
			routes[itm.route] = arr;
		}
	});
	fs.writeFile("./RTPI.json", JSON.stringify(routes));
};