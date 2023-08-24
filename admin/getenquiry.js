var http = require("http");
var logger= require('./logger');  //Adding loggers
var express = require('express');
var router = express.Router();
//var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.get('/' , function(req, res, next) {
    try {        
        req.admin_db.get('Enquiry').find({}, function(err, result) {    //Retrieving Data from Enquiry Table 
            if (err) {
                console.log(err);
            } else if (result.length) {
                var arr = JSON.stringify(result);
                var logobj={};
                logobj.UserID= "UserId";
                logobj.Data = result;
                //logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
                //console.log(arr);
                res.send(arr);
            } else {
                var logobj={};
                logobj.UserID= "UserId";
                logobj.Data = 'No document(s) found with defined "find" criteria!';
                //logger.log('info', `${JSON.stringify(logobj)}`); // Logging data into DB
                res.send('0');
            }
        })
    } catch (Ex) {
        logger.log('error',`${ex}`);  //logging error into DB
        console.log("Error in getting Enquiry values")
    }
});
module.exports = router;