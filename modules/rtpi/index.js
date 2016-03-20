//Module to get RTPI data
var request = require ("../httprequest").create();
//function to get real time bus data for a stop
exports.getRTPIData = function(stopid, callback) {
	var url = "https://data.dublinked.ie/cgi-bin/rtpi/realtimebusinformation?stopid="+stopid+"&format=json";
	request.get(url, 
		function (err, body) {
			if (err) {
				console.log(err);
				callback(err);
			} 
			else {
				data = transformRTPI(body); //transform Json
				callback(null, data);
			}
	});
}; 

//transforms the bus rtpi JSON from an Array to an object with bus nos as keys
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
