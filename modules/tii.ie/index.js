/**
 * Module to fetch Transport Infrastructure Ireland data
 */
var request = require ("../httprequest").create();
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

var travelTimeSitesUrl = "http://data.tii.ie/Datasets/Its/DatexII/TravelTimeSites/Content.xml";
var travelTimesUrl = 'http://data.tii.ie/Datasets/Its/DatexII/TravelTimeData/Content.xml';

exports.getTravelTimeSites = function (callback) {
	request.get(travelTimeSitesUrl, function (err, body) {
		if (err) {callback(err); return;}
		parser.parseString(body, function (err, result) {
			if (err) callback(err);
			var out = parseTravelTimeSitesJson(result);
	        callback(null, out);
	    });
	});
};

exports.getTravelTimesList = function (callback) {
	request.get(travelTimesUrl, function (err, body) {
		if (err) {callback(err); return;}
		parser.parseString(body, function (err, result) {
			if (err) callback(err);
			var out = parseTravelTimeJson(result);
	        callback(null, out);
	    });
	});
};

exports.getTravelTime = function (routeId, callback) {
	this.getTravelTimesList(function(err, traveltimes) {
		if (err) {callback(err); return;}
		travelTime = traveltimes[routeId];
		callback(null, travelTime);
	});
};

var parseTravelTimeSitesJson = function(ttsjson) {
	ttArray = ttsjson.d2LogicalModel.payloadPublication[0].measurementSiteTable[0].measurementSiteRecord;
	var out = {};
	for (var i = 0; i < ttArray.length; i++) {
		var tt = ttArray[i];
		var obj = {};
		obj.id = tt.$.id;
		obj.equipRef = tt.measurementEquipmentReference[0];
		obj.siteName = tt.measurementSiteName[0].value[0]._;
		obj.side = tt.measurementSide[0];
		var loc = tt.measurementSiteLocation[0].tpeglinearLocation[0];
		obj.direction = loc.tpegDirection[0];
		obj.locationType = loc.tpegLocationType[0];
		obj.to = {};
		obj.to.latitude = loc.to[0].pointCoordinates[0].latitude[0];
		obj.to.longitude = loc.to[0].pointCoordinates[0].longitude[0];
		obj.to.type = loc.to[0].name[0].tpegDescriptorType[0];
		obj.to.name = loc.to[0].ilc[0].descriptor[0].value[0]._;
		obj.to.nameType = loc.to[0].name[0].tpegDescriptorType[0];
		obj.to.otherName = loc.to[0].otherName[0].descriptor[0].value[0]._;
		obj.to.otherNameType = loc.to[0].otherName[0].tpegDescriptorType[0];;
		obj.from = {};
		obj.from.latitude = loc.from[0].pointCoordinates[0].latitude[0];
		obj.from.longitude = loc.from[0].pointCoordinates[0].longitude[0];
		obj.from.type = loc.from[0].name[0].tpegDescriptorType[0];
		obj.from.name = loc.from[0].ilc[0].descriptor[0].value[0]._;
		obj.from.nameType = loc.from[0].name[0].tpegDescriptorType[0];
		obj.from.otherName = loc.from[0].otherName[0].descriptor[0].value[0]._;
		obj.from.otherNameType = loc.from[0].otherName[0].tpegDescriptorType[0];;
		out[obj.id] = obj;
	}
	return out;
};

var parseTravelTimeJson = function(ttjson) {
	ttArray = ttjson.d2LogicalModel.payloadPublication[0].siteMeasurements;
	var out = {};
	for (var i = 0; i < ttArray.length; i++) {
		var obj = {};
		var tt = ttArray[i];
		obj.id = tt.measurementSiteReference[0];
		obj.measurementTime = tt.measurementTimeDefault[0];
		var bas = tt.measuredValue[0].basicDataValue[0];
		obj.period = bas.period[0];
		if (bas.fault && bas.fault[0] === 'true') {
			obj.fault = bas.fault[0];
			obj.faultReason = bas.faultReason[0].value[0]._;
		}
		else {
			obj.travelTime = tt.measuredValue[0].basicDataValue[0].travelTime[0];
			obj.freeFlowSpeed = tt.measuredValue[0].basicDataValue[0].freeFlowSpeed[0];
			obj.freeFlowTravelTime = tt.measuredValue[0].basicDataValue[0].freeFlowTravelTime[0];
			obj.normalTravelTime = tt.measuredValue[0].basicDataValue[0].normallyExpectedTravelTime[0];
		}
		out[obj.id] = obj;
	}
	return out;
};