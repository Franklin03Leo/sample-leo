function checkActiveSession() {
  try {
    var express = require("express");
    var router = express.Router();
    var fs = require("fs");
    var monk = require("monk");
    var db = monk("localhost:27017/Valurite_Unittest");
    var collection = db.collection("Userlogs");
    // console.log("ActiveUser")
    collection
      .update(
        {
          logout_time: { $eq: null },
          active_session_time: {
            $lt: new Date(new Date().getTime() - 31 * 1000),
          },
        },
        { $set: { logout_time: new Date() } },
        { multi: true }
      )
      .then((docs) => {
        //  res.send(docs);
        //   res.end();
        // console.log('docs  +'+ JSON.stringify(docs))
        return true;
      })
      .catch((err) => {
        console.log("err" + err);
      });
    // }
  } catch (ex) {
    console.log;
  }
}
module.exports = checkActiveSession;
