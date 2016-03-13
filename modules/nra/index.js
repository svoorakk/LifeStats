var request = require ("../httprequest").create();
var fs = require("fs");
var path = require('path');

exports.NRASetupList = function (callback) {
	var seedSetupId = "NRA_000000001034";
	var url = "https://www.nratrafficdata.ie/c2/calendar_alt.asp?sgid=ZvyVmXU8jBt9PJE$c7UXt6&spid="+seedSetupId;
	request.get(url, 
		function (err, body) {
			if (err) {
				console.log(err);
				callback(err);
			} 
			else {
				if (!callback) {
					callback = function(err) {
						console.log("Setup list updated");
					};
				}
				data = extractSetupList(body, callback);
			}
		}
	);
};

exports.NRATrafficStats = function (setup) {
	
};

var extractSetupList = function(html) {
	var pat = "_sites";
	var n1 = html.indexOf(pat);
	var n1 = html.indexOf("[", n1);
	var n2 = html.indexOf("]", n1);
	var l = html.substring(n1,n2+1);
	l = l.replace(/'/g, '"');
	var data = JSON.parse(l);
	var fname = path.join(__dirname, "..", "..", "data", "setuplist.json");
	fs.writeFile(fname, JSON.stringify(data), function(err) {
		callback(err);
	});
}