var rtpi = require('../rtpi');
exports.RTPIData = function (req, res) {
	var stopId = req.params.stopid;
	rtpi.getRTPIData(stopId, function(err, data) {
		if (err) {
			res.status(500);
		    res.render('error', { error: err });
		}
		else {
			res.send(data);			
		}
	})
};