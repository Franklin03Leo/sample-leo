const express = require('express');
const globalSettings = express.Router();
var logger = require('./logger');  //adding logger
//Post method
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
globalSettings.post('/',verifyToken, function (req, res, next) {
    try {

        const db = req.admin_db;
        const coll = db.collection('Param');

        if (!db || !db.collection) {
            res.json({});
            return;
        }

        const jsonObj = req.body;
        console.log(jsonObj)
        console.log("ss")
        let errorcount = 0;

        /** Backend Loop */
        for (let key in jsonObj) {
            if (jsonObj.hasOwnProperty(key)) {

                // DB Query Here
                coll.update({ ParamName: key },
                    {
                        $set: { ParamValue: jsonObj[key] },
                        $currentDate: { LastUpdatedDate: true }
                    }
                ).then((docs) => {
                    var logobj = {};
                    logobj.UserID = "UserID"
                    logobj.Data = docs;

                    logger.log('info', `${JSON.stringify(logobj)}`); // Logging data into DB

                    //   logger.log('info',`${JSON.stringify(docs)}`);
                    // docs contains the documents inserted with added **_id** fields
                    // Inserted 1 documents into the document collection
                }).catch((err) => {
                    logger.log('error', `${err}`);  //logging error into DB
                    // An error happened while inserting
                    errorcount++
                })
            }
        }
        //Method to check whether DB is updated
        if (errorcount) {

            res.status(400).send("unable to update the database");
            return;
        }
        res.status(200).json({ 'Global Settings': 'Updated Successfully' });
    }
    catch (ex) {
        logger.log('error', `${ex}`);  //logging error into DB
        console.dir(ex);
    }
})
//DB connection
//Get method to retrive ParamName and Param Value
globalSettings.get('/',verifyToken, function (req, res, next) {
    try {
        const db = req.admin_db;
        const coll = db.collection('Param');

        if (!db || !db.collection) {
            res.json({});
            return;
        }
        // DB Query here
        coll.find({ ParamName: { $ne: null } },
            { "_id": 0, "ParamName": 1, "ParamValue": 1 }
        ).then((docs) => {
            var logobj = {};
            logobj.UserID = "UserID"
            logobj.status = "ParamName and ParamValue retrieved from Param collection"
            //   logobj.Data = docs;
            logger.log('info', `${JSON.stringify(logobj)}`); // Logging data into DB
            res.json(docs);
        }).catch((err) => {
            logger.log('error', `${err}`);
        });
    }
    catch (ex) {
        logger.log('error', `${ex}`);
        console.dir(ex);
    }
})

module.exports = globalSettings;