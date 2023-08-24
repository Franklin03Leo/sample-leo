/* Fetch contract details from 'contracts' collection for the respective contract reference*/
var express = require('express');
var router = express.Router();
var logger = require('./logger');  //adding Logger
var verifyToken = require('../commonjs/Verify_JWT');//  To Verify Token
router.get('/', verifyToken, function (req, res, next) {
    //DB Connection and its parameters
    try {
        var strBody = req.query;
        var db = req.admin_db;
        var collection = db.collection('Contracts');
        var tempObj = {};
        tempObj["$match"] = { contract_reference: strBody.referencenum };
        var ProjectObject = {};
        ProjectObject["$project"] = {
            // "Exportflag": "$export_flag",
            // "DownloadLimit": "$download_limit",
            "GeneralAlert": "$general_alert_flag",
            "StartDate": "$valid_start_date",
            "EndDate": "$valid_to_date", _id: 0
        };
        //To fetch contract details 
        //DB Query
        collection.aggregate([tempObj, ProjectObject],
            function (err, result) {
                if (err) {
                    logger.log('error', `${err}`);   // logging error into DB
                    console.log(err);
                } else {
                    var obj = {
                        status: 'valid'
                    }
                    var arr = JSON.stringify(result);
                    var logobj = {};
                    logobj.UserID = "UserID"
                    logobj.Data = result;
                    //    logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB

                    //  logger.log('info',`${JSON.stringify(result)}`);
                    res.send(arr);
                }
            });
    }
    catch (ex) {
        logger.log('error', `${ex}`); //logging error into DB
        console.dir(ex);
    }
});
module.exports = router;