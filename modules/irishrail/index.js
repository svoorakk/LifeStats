/**
 * Module to fetch data from Irish Rail API
 * Refer - http://api.irishrail.ie/realtime/index.htm?realtime_irishrail 
 */
var request = require ("../httprequest").create();
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var urlStations = "http://api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML";
var urlStationTrains = "http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML?StationCode=";

exports.getStationTrainData = function (stationId, callback) {
	var url = urlStationTrains + stationId;
	request.get(url, function (err, body) {
		if (err) {callback(err); return;}
		parser.parseString(body, function (err, result) {
			if (err) callback(err);
			var out = parseStationTrainJson(result);
	        callback(null, out);
	    });
	});
};

var parseStationTrainJson = function(stJson) {
	var out = {};
	var obj = stJson.ArrayOfObjStationData;
	var trains = obj.objStationData
	for (var i = 0; i < trains.length; i++) {
		var train = trains[i];
		var lst = Object.keys(train);
		for (var j = 0; j < lst.length; j++) {
			var name = lst[j];
			var val = train[name][0];
			train[name] = val;
		}
		if (!out[train.Destination]) {
			out[train.Destination] = [];
		}
		out[train.Destination].push(train);
		
		//trains[i] = train;
	}
	return out;
};
