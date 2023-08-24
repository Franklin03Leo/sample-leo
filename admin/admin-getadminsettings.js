const express = require('express');
const getparams = express.Router();
var logger= require('./logger');  //adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
getparams.post('/',verifyToken,function (req, res, next) {
    try {
        var db = req.admin_db;
        var coll = db.get('Param_New');
        coll.find({}, function(err, result) {    //Retrieving Data from Param Table 
            if (err) {
                console.log(err);
            } else if (result.length) {
                var arr = JSON.stringify(result); 
                res.send(arr);
            } else {
                // var logobj={};
                // logobj.UserID= "UserId";
                // logobj.Data = 'No document(s) found with defined "find" criteria!';
                // logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
             //   console.log('No document(s) found with defined "find" criteria!');
            }
        })
    } catch (Ex) {
        // logger.log('error',`${ex}`);  //logging error into DB
        console.log("Error in getting Parameter values")
    }
});
module.exports = getparams;