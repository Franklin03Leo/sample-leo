// Fetch the Param values from Param collection
const express = require('express');
const logger = require('./logger');   //adding loggers
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
const router = express.Router();
router.get('/',function (req, res, next) {
    try{
        //db connection
        const db = req.admin_db;
        const coll = db.collection('param');
        //  Query to get the data from DB for onload param default data
        coll.find({ param_name: { $in: ["export_flag", "download_limit", "general_alert_flag", "No_of_session"] } },
            {
                "_id": 0, "param_name": 1, "param_value": 1
            }).then((docs) => {
                //console.log('param values are retrieved');
                res.json(docs);
                var logobj={};//object initialization
                logobj.UserIload= "dummyuserName@analyticBrains.com";//adding userid to object
                logobj.Data = docs;//adding data to object
              //  logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
               
            }).catch((err) => {
                //console.log("Error in retriving param values from DB " + err);
               logger.log("error",`${err}`);  //logger error - added by SRINIVASAN
            }).then(() => db.close())
    }
    catch(err){ 
        logger.log("error",`${err}`);     //logger error - added by SRINIVASAN
    }
});
module.exports = router;