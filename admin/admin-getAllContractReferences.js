var express = require('express');
const logger = require('./logger');       //adding Loggers
var Router = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
Router.get('/',verifyToken, function (req, res, next) {
    //DB Connection and its parameters
    var strBody = req.query;
    var db = req.admin_db;
    var collection = db.collection('Contracts');
    var contRef = strBody.contract_reference;
    try {
        //DB Query 
        /* Check the Contract reference is exists or not in 'contracts' collection*/
        collection.find({ 'contract_reference': contRef }, function (error, docs) {
            if (error) {
                
                logger.log("error", `${error}`);//logger error 
                res.send('1');
            } if (docs == "") {
                res.send('2');   // If not present '2' will be sent

                var logobj = {};//object initialization
                logobj.UserID = "dummyuserName@analyticBrains.com";//adding userid to object
                logobj.Data = "Contract Reference is not present";//adding data to object
                logger.log('info', `${JSON.stringify(logobj)}`);//object parse into logger
            } else {
                res.send('3');
                // If already exits '3' will be sent
                var logobj = {};//object initialization
                logobj.UserID = "dummyuserName@analyticBrains.com";//adding userid to object
                logobj.Data = "Contract Reference is already present";//adding data to object
              //  logger.log('info', `${JSON.stringify(logobj)}`);//object parse into logger
            }
        });
    }
    catch (ex) {
        //logger error - added by SRINIVASAN
        logger.log("error", `${error}`);
        //console.dir(ex);
    }
});
module.exports = Router;