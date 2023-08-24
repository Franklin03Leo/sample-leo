/* Get the User Preference, from 'userpreference' collection */
const express = require('express');
const getPreferences = express.Router();
var logger= require('./logger');   //Adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
getPreferences.get('/',verifyToken, function (req, res, next) {
    //DB Connection
    try
    {
        const db = req.admin_db;
        const coll = db.collection('Userpreference');
        const email_id = req.query.username;

        // Query to find the userpreference, based on the given emailid
        coll.find({ 'email_id': email_id }, { 'preference_id': 1, "_id": 0 })
            .then((docs) => {
                console.log('Preferences retrieved');
             //   console.log(docs);
        
            var logobj={};
            logobj.UserID= email_id,
            logobj.Data = docs;
        
                res.json(docs);
            }).catch((err) => {
                logger.log('error',`${err}`);  //logging error into DB
                console.log("Error in retriving Company Names from DB " + err);
            })  
    }
    catch (ex) {
        logger.log('error',`${ex}`);  //logging error into DB
		console.log(ex)
	}
   });
module.exports = getPreferences;