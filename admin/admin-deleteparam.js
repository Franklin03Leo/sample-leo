var http = require("http");
var logger= require('./logger');   //adding loggers
var express = require('express');
var router = express.Router();
//"Measurement,PropertyType"
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.post('/',verifyToken , function(req, res, next) {
    try {
        var strBody = req.body;
        /*req.on("data", function(chunk) {
            strBody += chunk;
        });*/
        //req.on("end", function() {

            var jsonObj = strBody;

            var ParamID = jsonObj.ParamID;
            // console.log(ParamID);
            console.log("Connected to Database");
            var db = req.db;
            var coll = db.get('Param');
                                            //Retrieving ParamID
            // coll.find({'ParamName': {'$in' : ["Utility" , "Fitness" , "Health"]}})coll.find({ParamName:jsonObj.Unit.toString()})
            coll.find({
                'ParamID': ParamID             
            }, function(err, result) {
                if (err) {
                    console.log(err);
                    logger.log('error',`${ex}`);   
                } else if (result.length) {
                    // coll.remove({'ParamID':ParamID });
                    var logobj={};
                    logobj.UserID= "UserID"
                    logobj.Data = result;
                
                //    logger.log('info',`${JSON.stringify(result)}`);
                                                //*****Updating ParamStatus as InActive */
                    coll.update({
                        'ParamID': ParamID
                    }, {
                        $set: {
                            'ParamStatus': "InActive"
                        }
                    })
                }
                //Close connection
                //db.close();
                console.log("Deleted the param")
                var logobj={};
                logobj.UserID= "UserID";
                logobj.Data = "Deleted the param";
                res.send("1");
            })
        //});
    } catch (Ex) {
        logger.log('error',`${err}`);
        console.log("connection error");
    }
});
module.exports = router;