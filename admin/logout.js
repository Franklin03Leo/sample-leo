var express = require("express");
const logger = require("./logger");   //adding loggers
var router = express.Router();

router.post("/", function (req, res, next) {
  try {
    var strBody = req.body;
    var jsonObj = strBody;
    var EmailID = jsonObj.userID.toLowerCase();
    var param = jsonObj.param;
    var session_id = jsonObj.session_id;
    // DB connection
    const db = req.admin_db;
    var collection = db.collection("Userlogs");
    var usercollection = db.collection("User");
    //*******************************Retrieves set of docs matching the find Criteria**********************************//
    var match = {};
    if (param == "killsession") {
      match = { email_id: EmailID, logout_time: { $eq: null } };
    } else {
      match = {
        email_id: EmailID,
        session_id: session_id,
        logout_time: { $eq: null },
      };
    }
    collection.find(match, function (err, docs) {
      if (docs == "") {
        var obj = { status: "InValid" };
        //console.log(" docs empty ");
        // logger info starts here - added by SRINIVASAN
        var logobj={};//object initialization
        logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
        logobj.Data = obj;//adding data to object
        logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
        // logger info ends here - added by SRINIVASAN
        res.send(arr);
        res.end();
      } else {
        try {
          let nowtime = new Date();
          if (param == "logout") {
            //called when logout button pressed
            collection.update(
              {
                email_id: EmailID,
                session_id: session_id,
                logout_time: { $eq: null },
              },
              {
                $set: {
                  logout_time: nowtime,
                },
              },
              { multi: true }
            ).then((docs)=>{
                console.log(" docs logout ");
               
                var logobj={};//object initialization
                logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
                logobj.Data = docs;//adding data to object
                logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
               
            }).catch((err)=>{
                logger.log("error",`${err}`);
            });
            var obj = { status: "Valid" };
            
            var logobj={};//object initialization
            logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
            logobj.Data = obj;//adding data to object
            logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
       
            res.send(arr);
            res.end();
          } else if (param == "sessionupdate") {
            //every ten seconds called, to check whether user is active or not
            collection.update(
              {
                email_id: EmailID,
                session_id: session_id,
                logout_time: { $eq: null },
              },
              {
                $set: {
                  session_update_time: nowtime,
                },
              }
            ).then((docs)=>{
                //console.log(" docs update ");
                // logger commented because it get called every 10 seconds
                //logger.log("info",`${JSON.stringify(docs)}`);
            }).catch((err)=>{
              // logger commented because it get called every 10 seconds
              //logger error - added by SRINIVASAN
              logger.log("error",`${err}`);
            });
            var obj = { status: "Valid" };
            var arr = JSON.stringify(obj);
            // logger commented because it get called every 10 seconds
            //logger.log("info",`${arr}`);
            res.send(arr);
            res.end();
          } else if (param == "killsession") {
            // when already user logged in to another session, it ask to kill that session
            collection.update(
              { email_id: EmailID, logout_time: { $eq: null } },
              {
                $set: {
                  logout_time: docs[0].session_update_time,
                },
              },
              { multi: true }
            ).then((docs)=>{
                // console.log(" docs killsession ");
               // logger info starts here - added by SRINIVASAN
                var logobj={};//object initialization
                logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
                logobj.Data = docs;//adding data to object
                logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
                // logger info ends here - added by SRINIVASAN
            }).catch((err)=>{
              //logger error - added by SRINIVASAN
                logger.log("error",`${err}`);
            });
            var obj = { status: "Valid" };
            // logger info starts here - added by SRINIVASAN
            var logobj={};//object initialization
            logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
            logobj.Data = obj;//adding data to object
            logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
            // logger info ends here - added by SRINIVASAN
            res.send(arr);
            res.end();
          }
        } catch (ex) {
          //logger error - added by SRINIVASAN
            logger.log("error",`${ex}`);
          res.end();
        }
      }
    });
  } catch (ex) {
    //logger error - added by SRINIVASAN
      logger.log("error",`${ex}`);
  }
});
module.exports = router;
