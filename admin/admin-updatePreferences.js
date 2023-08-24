/* To set the user preference in 'userpreference' collection, updates when the preference is changed */
const express = require("express");
const logger = require("./logger");   //Adding Loggers
const updatePreferences = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
updatePreferences.post("/",verifyToken, function (req, res, next) {
  try {
    //DB Connection
    const db = req.admin_db;
    const coll = db.collection("Userpreference");
    if (!db || !db.collection) {
      res.json({});
      return;
    }
    //console.log(req);
    // Query to update the userpreference
    coll
      .update(
        { email_id: req.body.userName },
        {
          $set: {
            preference_id: req.body.preferenceId,
            last_updated_date: new Date(),
            last_updated_by: req.body.userName,
          },
        },
        { upsert: true }
      )
      .then((docs) => {
        //console.dir(docs);
        res.send(docs);
       
        var logobj = {};//object initialization
        logobj.UserID = req.body.userName;//adding userid to object
        logobj.Data = docs;//adding data to object
        logger.log("info", `${JSON.stringify(logobj)}`);//object parse into logger
      })
      .catch((err) => {
        
        logger.log("error", `${err}`);  // logger error - added by SRINIVASAN
        console.log("Error in Updating DB " + err);
        errorcount++;
      });
  } catch (err) {
    logger.log("error", `${err}`);   // logger error - added by SRINIVASAN
  }
});

module.exports = updatePreferences;
