/**
 * Route handling logic
 */
var rtpi = require('../rtpi'); //module to fetch real-time traffic info
var nradata = require('../nra'); //module to fetch NRA traffic stats
var tiidata = require('../tii.ie'); //module to fetch NRA traffic stats
var carparks = require('../carparks'); //module to fetch car park status
var irishRail = require('../irishrail'); //module to fetch irish rail data
//Function to handle request for RTPI data
exports.RTPIData = function (req, res) {
	var stopId = req.params.stopid; //stop no. for which data is required
	rtpi.getRTPIData(stopId, function(err, data) {
		sendResponse(res, err, data);
	});
};
//Function to handle request for traffic volume data
exports.TrafficStats = function (req, res) {
	var setupId = req.params.setupid; //id of the NRA data collection setup
	nradata.getTrafficStats(setupId, function(err, data) {
		sendResponse(res, err, data);
	});
};
//Function to handle request for travel time data
exports.TravelTime = function (req, res) {
	var routeId = req.params.routeid; //id of the TTI route
	tiidata.getTravelTime(routeId, function(err, data) {
		sendResponse(res, err, data);
	});
};
//Function to handle request for car park data
exports.CarParks = function (req, res) {
	carparks.getCarParkData(function(err, data) {
		sendResponse(res, err, data);
	});
};
//Function to handle request for station upcoming train data
exports.StationTrains = function (req, res) {
	var stationId = req.params.stationid; //code of the station 
	irishRail.getStationTrainData(stationId, function(err, data) {
		sendResponse(res, err, data);
	});
};



//Function to process output from modules and send it to response.
var sendResponse = function (res, err, data) {
	if (err) {
		res.status(500);
	    res.render('error', { error: err });
	}
	else if (data == null){
		res.status(403).send('Not found');
	}
	else {
		res.send(data);			
	}
};