var request = require ("../httprequest").create();
var fs = require("fs");
var stop;
exports.getRTPIData = function(stopid, callback) {
	var url = "https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid="+stopid+"&format=json";
	console.log(url);
	request.get(url, 
		function (err, body) {
			if (err) {
				console.log(err);
				callback(err);
			} 
			else {
				data = transformRTPI(body);
				callback(null, data);
			}
	});
}; 

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
	return routes;
};
