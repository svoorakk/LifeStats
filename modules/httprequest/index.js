/**
 * Module to make HTTP Get requests
 */
var request = require('request');

var options={};
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

/**
 * @authOptions - {user : "", pass: ""}
 */
var httpRequest = function () {

};

/**
 * Makes a GET request and gets result
 * @param URL - String
 * @param callback - function (err, result)
 */
httpRequest.prototype.get= function(URL,callback) {
	var requestOptions = {};
	requestOptions.method = "GET";
	requestOptions.uri = URL;
	//console.log(URL);
	request(requestOptions, function (err, resp, body) {
		if (err) {
			callback(err);
		}
		if (!err && resp.statusCode == 200){
			//console.log('Body - ', body);
			callback(err, body);
		}
	}).end();
};

exports.create = function (options) {
	return new httpRequest(options);
};