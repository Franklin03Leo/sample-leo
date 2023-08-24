/* To check the username is exist or not */
var express = require('express');
var Router = express.Router();
var logger= require('./logger');   //adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token

Router.get('/',verifyToken, function (req, res, next) {
    //DB Connection and its query
    try{
    var strBody = req.query;
    var db = req.admin_db;
    var collection = db.collection('User');
    var email_id = strBody.username;
             collection.find({'ContactDetails.EmailID':email_id}, function(error, docs) {
                if (error) {
                    res.send('1');
                    logger.log('error',`${error}`);   //logging error into DB
                    // if error occurs '1' will be sent
                } if (docs == "") {
                    var logobj={};
                    logobj.UserID= email_id;
                    logobj.Status="Username is not exist"
                    logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
                
                    res.send('2');  
                    // username is not exist '2' will be sent
                } else {
                    console.log('Already Exists Email');
                    var logobj={};
                    logobj.UserID= email_id;
                    logobj.Status="Already Exists"
                    logobj.Data = docs;
                    logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
                                
                    res.send('3');
                    // Already exists '3' will be sent
                }
            });
    }
    catch (ex) { 
        console.dir(ex);
        logger.log('error',`${ex}`);  // logging error into DB
    }
});
module.exports = Router;