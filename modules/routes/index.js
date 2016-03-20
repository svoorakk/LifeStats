/**
 * Route handling logic
 */
var rtpi = require('../rtpi'); //module to fetch real-time traffic info
var nradata = require('../nra'); //module to fetch NRA traffic stats
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