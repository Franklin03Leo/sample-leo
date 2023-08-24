var http = require("http");
var logger= require('./logger');  //Adding loggers
var express = require('express');
var router = express.Router();
//"Measurement,PropertyType"
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.get('/',verifyToken, function(req, res, next) {
    try {
        var db = req.db;
        var coll = db.get('Param');
        coll.find({}, function(err, result) {    //Retrieving Data from Param Table 
            if (err) {
                console.log(err);
            } else if (result.length) {
                var arr = JSON.stringify(result);
                var logobj={};
                logobj.UserID= "UserId";
                logobj.Data = result;
                logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
            
               // logger.log('info',`${arr}`);
                console.log(arr);
                res.send(arr);
            } else {
                var logobj={};
                logobj.UserID= "UserId";
                logobj.Data = 'No document(s) found with defined "find" criteria!';
                logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
             //   console.log('No document(s) found with defined "find" criteria!');
            }
        })
    } catch (Ex) {
        logger.log('error',`${ex}`);  //logging error into DB
        console.log("Error in getting Parameter values")
    }
});
module.exports = router;