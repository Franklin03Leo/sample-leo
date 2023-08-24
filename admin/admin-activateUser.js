var express = require("express");
var router = express.Router();
const logger = require("./logger");
require("dotenv").config();
const bcrypt = require("bcryptjs");

router.post("/", function (req, res, next) {
  // console.log("test", req.body);
  var jsonObj = req.body;
  var userid = jsonObj.userId;
  var passwrd = jsonObj.passwd;

  var db = req.admin_db;
  //var flag = 5;
  var collection = db.collection("User");
  try {
    collection.find({ "ContactDetails.EmailID": userid }, function (err, docs) {
      if (err) {
        console.log(err);
        logger.log("error", `${err}`);
      } else {
        if (bcrypt.compareSync(passwrd, docs[0].PasswordDetails.Password)) {
          res.send("1");
          logger.log('info',`Password validation Successful`);
        } else {
          res.send("2");
        }
      }
    });
  } catch (e) {
    console.log(e);
    logger.log('error',`${e}`)
  }
});
module.exports = router;
