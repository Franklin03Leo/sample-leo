/* Fetch all the Param values from 'param' collection */
var express = require('express');
var router = express.Router();
var logger = require('./logger'); //adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.get('/',verifyToken, function (req, res, next) {
    try {
        //DB Connection to fetch ParamName
        const db = req.db;   // 
        const coll = db.collection('Param');
        coll.find({ "ParamName": { $ne: null } }, { "ParamValue": 1, "ParamName": 1, 'CreatedDate': 1, 'ParamId': 1, "_id": 0 })
            .then((docs) => {
                console.log('Data retrieved');
                var logobj = {};
                logobj.UserID = "UserID"
                logobj.Data = docs;
                logger.log('info', `${JSON.stringify(logobj)}`); // Logging data into DB      

                res.json(docs);
            }).catch((err) => {
                logger.log('error', `${err}`); //logging error into DB
                //  console.log("Error in retriving into DB " + err);
            })
    }
    catch (ex) {
        logger.log('error', `${ex}`); // logging error into DB
    }
});
module.exports = router;