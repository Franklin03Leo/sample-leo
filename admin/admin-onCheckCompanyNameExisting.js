// To check the Company Name exist or not
var express = require('express');
const logger = require('./logger');   //adding loggers
var Router = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
Router.get('/',verifyToken, function (req, res, next) {
      //DB Connection and its query
    var strBody = req.query;
    var db = req.admin_db;
    var collection = db.collection('Company');
    var companyName = strBody.companyname;
    try {
        // Query to check the companyname
        collection.find({ 'CompanyName': companyName }, function (error, docs) {
            if (error) {
                res.send('1');  
                logger.log("error",`${error}`);   //logger error - added by SRINIVASAN
            //if error occurs '1' will be sent
            } if (docs == "") {
                res.send('2');
                var logobj={};//object initialization
                logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
                logobj.Data = "Company Name is not exists";//adding data to object
                logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
              
                //if not exists '2' will be sent
            } else {
               
                var logobj={};//object initialization
                logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
                logobj.Data = "Already Exists Company Name";//adding data to object
                logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
             
                //console.log('Already Exists Company Name');
                res.send('3');
                //if exists '3' will be sent
            }
        });
    }
    catch (ex) {
       
        logger.log("error",`${ex}`);   //logger error - added by SRINIVASAN
     }
});
module.exports = Router;