var carpark = require('../');
carpark.getCarParkData(function(err,data){console.log(err,JSON.stringify(data));});