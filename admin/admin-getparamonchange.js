var http = require("http");
var express = require('express');
var router = express.Router();
var logger=require('./logger');  //adding loggers
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.post('/',verifyToken,function(req, res, next) {
    try {
        var strBody = req.body;
        /*req.on("data", function(chunk) {
            strBody += chunk;
        });*/
        //req.on("end", function() {
            // console.log("Received posted data: " + strBody);

            var jsonObj = strBody;

            var ParamID = jsonObj.ParamID;
            // console.log(ParamID);
            //db connection
            var db = req.db;
            var coll = db.get('Param');
            // coll.find({'ParamName': {'$in' : ["Utility" , "Fitness" , "Health"]}})coll.find({ParamName:jsonObj.Unit.toString()})
        
            /*To fretch Param Data From Param Collection*/
            coll.find({
                'ParamID': ParamID
            }, function(err, result) {
                if (err) {
                    //logger error - added by SRINIVASAN
                    logger.log("error",`${err}`);
                } else if (result.length) {
                    var arr = JSON.stringify(result);
                    // logger info starts here - added by SRINIVASAN
                    var logobj={};//object initialization
                    logobj.UserIDParamAppraisal= "dummyuserName@analyticBrains.com";//adding userid to object
                    logobj.Data = result;//adding data to object
                    // logger info ends here - added by SRINIVASAN
                    res.send('2');
                } else {
                    // logger info starts here - added by SRINIVASAN
                    var logobj={};//object initialization
                    logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
                    logobj.Data = 'No document(s) found with defined "find" criteria!';//adding data to object
                    logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
                    res.send('3');
                }
            })

        //});
    } catch (Ex) {
        //logger error - added by SRINIVASAN
        logger.log("error",`${Ex}`);
    }
});
module.exports = router;