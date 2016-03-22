/**
 * Module to fetch Car Park status
 */
var request = require ("../httprequest").create();
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var carParkUrl = "http://opendata.dublincity.ie/TrafficOpenData/CP_TR/CPDATA.xml";

exports.getCarParkData = function (callback) {
	request.get(carParkUrl, function (err, body) {
		if (err) {callback(err); return;}
		parser.parseString(body, function (err, result) {
			if (err) callback(err);
			var out = parseCarParkJson(result);
	        callback(null, out);
	    });
	});
};

var parseCarParkJson = function(cpJson) {
	var out = {};
	var obj = cpJson.carparkData;
	var dirs = Object.keys(obj);
	var ts = obj.Timestamp[0];
	for (var i = 0; i < dirs.length; i++) {
		if (dirs[i] == "Timestamp") {
			continue;
		}
		var lst = obj[dirs[i]][0].carpark;
		for (var j = 0; j < lst.length; j++) {
			var name = lst[j].$.name;
			var spaces = parseInt(lst[j].$.spaces);
			var park = {};
			park.name = name;
			park.spaces = spaces;
			park.zone = dirs[i];
			park.timestamp = ts;
			out[name] = park;
		}
	}
	return out;
};

