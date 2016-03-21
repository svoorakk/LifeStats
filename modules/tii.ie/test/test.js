var fs = require('fs');
var tii = require('../');
//tii.getTravelTimesList(function(err,data) { console.log(JSON.stringify(data));});
//tii.getTravelTimeSites(function(err,data) { console.log(JSON.stringify(data));});
tii.getTravelTime('ROI_ANPR_M1N.61-M1N.338', function(err,data) { console.log(JSON.stringify(data));});