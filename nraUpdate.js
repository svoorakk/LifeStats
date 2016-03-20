/**
 * NRA Data updater for nightly update of traffic statistics
 */
var nra = require("./modules/nra");
var fs = require('fs');

//function to update traffic volume - recursively called for each setup one by one
var UpdateTrafficStats = function(setupList) {
	//if setup list is empty, nothing to do
	if (setupList.length == 0) {
		console.log("NRA traffic data update completed: "+new Date().toString());
		return;
	}
	//get first element from array
	var id = setupList.shift().id;
	//callback to handle traffic stats query response
	var cbTraffic = function (err, trafficdata) {
		if (err) {
			console.log('Error fetching NRA traffic data for '+id+':'+err.toString());
		}
		//write data to file with name eg. traffic_NRA_000000001011.json
		fs.writeFileSync("./data/traffic_"+id+".json", JSON.stringify(trafficdata));
		console.log("NRA traffic data for "+id+" updated: "+new Date().toString());
		//repeat
		UpdateTrafficStats(setupList); 
	}; //callback function ends here
	console.log("NRA traffic data update for "+id+" started: "+new Date().toString());
	//Get traffic stats
	nra.NRATrafficStats(id, cbTraffic);	
};

//call back function for getting NRA setup list
cbSetup = function(err, data) {
	if (err) {
		console.log('Error fetching NRA setup data:'+err.toString());
	}
	//write file to disk
	fs.writeFileSync("./data/setuplist.json", JSON.stringify(data));
	console.log("NRA setup list updated:"+new Date().toString());
	//start the traffic volume data update
	console.log("NRA traffic data update started: "+new Date().toString());
	UpdateTrafficStats(data);
};

console.log("NRA setup list update started:"+new Date().toString());
//Get NRA setup list
nra.NRASetupList(cbSetup);