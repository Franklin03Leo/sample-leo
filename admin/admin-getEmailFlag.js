var express = require('express');
const logger = require('./logger');//Adding loggers
var router = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.get('/',verifyToken, function (req, res, next) {
    try {
        //DB Connection
        const db = req.admin_db;
        const paramcollection = db.collection('Param');

        /* Get the Email Flag & from mail id from the param table */
        //DB Query
        paramcollection.find({
            "ParamName": {
                $in: [
                    "Email_Flag",
                    "FromEmail"
                ]
            }
        }, { "_id": 0, "ParamValue": 1, "ParamName": 1 })
            .then((docs) => {
                res.send(docs);
                // logger info starts here - added by SRINIVASAN
                var logobj = {};//object initialization
                logobj.UserID = "dummyuserName@analyticBrains.com";//adding userid to object
                logobj.Data = docs;//adding data to object
                logger.log('info', `${JSON.stringify(logobj)}`);//object parse into logger
                // logger info ends here - added by SRINIVASAN
            }).catch((err) => {
                console.log("Error in retriving from DB " + err);
                //logger error - added by SRINIVASAN
                logger.log("error", `${err}`);
            })
    }
    catch (err) {
        //logger error - added by SRINIVASAN
        logger.log("error", `${err}`);
    }
});
module.exports = router;