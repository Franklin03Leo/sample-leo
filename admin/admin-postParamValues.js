/* Insert/Update data in 'param' collection */
var express = require("express");
var path = require("path");
const logger = require("./logger");   //adding loggers
var app1router = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
app1router.post("/",verifyToken, function (req, res) {
  try {
    //DB Connection and its query
    const db = req.db;
    const coll = db.collection("Param");
    // looping until all selected value updated
    for (let obj of req.body) {
      //update query to update param value in Param collection 
      coll.update(
        { ParamName: obj.param_name },
        {
          $set: {
            ParamId: obj.param_id,
            ParentId: obj.parent_id,
            ParamValue: obj.param_value,
            CreatedDate: new Date(),
            LastUpdatedDate: new Date(),
          },
        },
        { upsert: true },
        function (err, update) {
          if (update) {
            // logger info starts here - added by SRINIVASAN
            var logobj={};//object initialization
            logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
            logobj.Data = update;//adding data to object
            logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
            // logger info ends here - added by SRINIVASAN
            res.json(update);
          }
          if (err) {
            console.log("Error" + err);
            logger.log("error", `${err}`);  //logger error - added by SRINIVASAN
          }
        }
      );
    }
  } catch (err) {
   
    logger.log("error", `${err}`);  //logger error - added by SRINIVASAN
  }
});
module.exports = app1router;
