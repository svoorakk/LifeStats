var request = require ("../httprequest").create();
var fs = require("fs");
var path = require('path');

var cols = new Array("Mon","Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Workday", "7 Day", "Count");
var days = new Array("Sun", "Mon","Tue", "Wed", "Thu", "Fri", "Sat"); //day of week lookup

//function to get the Setup list
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
						console.log("NRA setup list updated:"+new Date().toString());
					};
				}
				data = extractSetupList(body, callback); //parse and transform response
			}
		}
	);
};

//function to get the traffic stats from NRA database
exports.NRATrafficStats = function (setupId, callback) {
	var intVal = "4"; //for data at 15 min intervals
	var dir = "-3"; //all directions
	var dt1 = new Date(); 
	var dt2 = new Date(dt1);
	dt2.setDate(dt2.getDate()-30);
	dt2.toISOString().substring(0,10);
	var endDt = dt1.toISOString().substring(0,10);
	var startDt = dt2.toISOString().substring(0,10);
	var url = "https://www.nratrafficdata.ie/c2/tfweekreport.asp?sgid=ZvyVmXU8jBt9PJE$c7UXt6" +
		"&spid=" + setupId + "&reportdate=" + startDt + "&enddate=" + endDt+ "&intval="+intVal +
		"&dir="+ dir + "&excel=1";
	//var body = fs.readFileSync(path.join(__dirname, "temp.xls")).toString();
	//data = extractTrafficData(body, callback);
	request.get(url, 
		function (err, body) {
			if (err) {
				callback(err);
			} 
			else {
				if (!callback) {
					callback = function(err) {
						console.log("Traffic data updated");
					};
				}
				//fs.readFileSync(path.join(__dirname, "temp.xls"), body);
				extractTrafficData(body, callback);
			}
		}
	);
};
//provides trafficstats for current time and day
exports.getTrafficStats = function (setupId, callback) {
	//get the data from disk - TODO:need to add caching
	var fname = path.join(__dirname,'..','..','data','traffic_'+setupId+'.json');
	fs.readFile(fname, function (err, contents) {
		var out = {};
		var data = JSON.parse(contents);
		//get current time
		var dt = new Date();
		//get day of week
		var day = days[dt.getDay()];
		var hr = dt.getHours();
		//calculate time to nearest quarter hour
		var minNorm = Math.round(dt.getMinutes()/15.0, 0)*15;
		if (minNorm == 60) {
			hr++;
			minNorm = 0;
		}
		var minStr = ("0"+minNorm.toString()).slice(-2);
		var hrStr = ("0"+hr.toString()).slice(-2);
		var timeStr = hrStr+":"+minStr+':00';
		//get the lane names into array
		var lanes = Object.keys(data);
		//for each lane, get the  traffic data
		for (var i = 0; i < lanes.length; i++) {
			var lane = lanes[i];
			var laneData = data[lane];
			var obj = {};
			//get the traffic
			var traffic = laneData[timeStr][day];
			//get the peak volume
			var peak = laneData["Peak Volume"][day];
			if (peak < traffic) 
				peak = traffic;
			//calculate %
			var pctOfPeak = Math.round(100 * traffic / peak);
			obj.traffic = traffic;
			obj.peakVolume = peak;
			obj.pctOfPeak = pctOfPeak;
			out[lane] = obj;
		}
		callback(null, out);
	});
};
//parses the html for setup list and returns a JSON Array
var extractSetupList = function(html, callback) {
	var pat = "_sites"; //looking for sites property
	var n1 = html.indexOf(pat);
	n1 = html.indexOf("[", n1); //start of array
	var n2 = html.indexOf("]", n1); //end of array
	var l = html.substring(n1,n2+1);
	l = l.replace(/'/g, '"'); //replace single quotes with double quotes to allow for JSON parsing
	var data = JSON.parse(l);
	callback(null, data);
};

//parses the html for traffic data
var extractTrafficData = function(html, callback) {
	var out = {};
	var n1 = 0;
	var n2 = 0;
	var tbl = "";
	while (n1 > -1) {
		n1 = html.indexOf('<th style="text-align:left; font-size:110%;" colspan=11>', n2); //look for header row
		if (n1 < 0) {
			break;
		}
		n2 = html.indexOf("<tr><td colspan=11>&nbsp;</td></tr>", n1); //empty row - break in data
		if (n2 < 0) {
			n2 = html.indexOf("</table>", n1); //or end of data
		}
		tbl = html.substring(n1,n2);
		//parse html data table for traffic data
		obj = processTrafficTable(tbl); 
		out[obj[0]] = obj[1];
	}
	callback(null,out);
};

//parses html table for traffice data
var processTrafficTable = function(tbl) {
	var n1t = tbl.indexOf('1>')+2;
	var n2t = tbl.indexOf('</th>');
	var title = tbl.substring(n1t,n2t);
	var out = {};
	var obj;
	var rowtext = "";
	var n1 = 0;
	var n2 = 0;
	while (n1 > -1) {
		n1 = tbl.indexOf('<tr', n2); //row begin
		n2 = tbl.indexOf('</tr>', n1); //row end
		rowtext = tbl.substring(n1, n2);
		obj = processTrafficTSRow(rowtext); //process the row
		if (obj !== null) {
			out[obj[0]] = obj[1];
		}
	}
	return [title,out];
};
//parses a table row and extracts traffic data
var processTrafficTSRow = function(row) {
	var out = {};
	var patTSStrt = '<td class="RHR"'; //first cell pattern
	var n1 = row.indexOf(patTSStrt);
	n1 = row.indexOf(">", n1)+1;
	var n2 = row.indexOf("</td>", n1); //end of cell
	var key = row.substring(n1,n2);
	if (key.indexOf("<t") != -1) { //if the cell contains html characters then ignore the whole row
		return null;
	}
	var traffic = 0; 
	var i = 0;
	//loop through cells and and get the values
	while (i < cols.length) {
		n1 = row.indexOf("<td", n2)+3;
		n1 = row.indexOf('>', n1)+1;
		n2 = row.indexOf("</td>", n1);
		if (key == 'am Peak' || key == 'pm Peak')
			traffic = row.substring(n1,n2); //not numbers
		else
			traffic = parseInt(row.substring(n1,n2),10); //numbers
		out[cols[i]] = traffic;
		i++;
	}
	return [key,out];
};