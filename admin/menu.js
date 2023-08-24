var express = require('express');
const logger = require('./logger');  //adding loggers
var router = express.Router();

router.get('/', function (req, res, next) {
	try {
		//DB connection 
		var db = req.admin_db;
		var collection = db.collection('menu');
		console.log("shjkhkjhkjf")
		//*******************************Retrieves set of docs matching the find Criteria**********************************//
		collection.find({}, function (err, docs) {
			//Check for Empty docs     
			if (err) {
				//logger error - added by SRINIVASAN
				logger.log("error",`${err}`);
				}
				else if(docs)
				{
					var arr = JSON.stringify(docs);
					// logger info starts here - added by SRINIVASAN
					var logobj={};//object initialization
					logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
					logobj.Data = docs;//adding data to object
					logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
					// logger info ends here - added by SRINIVASAN
					res.send(arr);
				}
		})
	}
	catch (ex) {
		//logger error - added by SRINIVASAN
		logger.log("error",`${ex}`);
	}
});
module.exports = router;