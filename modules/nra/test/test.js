var nra = require("../");
cb = function(err, data) {
	console.log(data);
	console.log(err);
};

nra.NRASetupList(cbSetup);

nra.NRATrafficStats('NRA_000000001035', cb);
