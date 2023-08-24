var express = require("express");
var router = express.Router();
const logger = require("./logger");
require("dotenv").config();
var verifyToken = require("../commonjs/Verify_JWT"); //  To Verify Token

router.post("/",verifyToken, function (req, res, next) {
  //DB connection and parameters
  try {
    var db = req.admin_db;
    var flag = req.body.flag;
    //var flag = 5;
    var collection = db.collection("UserRolesTypes");
    // getting user types
    if (flag == 0) {
      collection.find(
        { Value: { $ne: null } },
        { _id: 0 },
        function (err, docs) {
          if (err) {
            logger.log("error", `${err}`);
            res.send(err);
          } else if (docs == " ") {
            console.log("Document not Found");
            res.send(0);
            logger.log("info", `Record not Found`);
          } else {
            console.log("Data", docs);
            res.send(docs);
            logger.log("info", `${docs}`);
          }
        }
      );
    } else if (flag == 2) {
      // Getting Appraiser role
      collection.find(
        {
          AppraiserRole: {
            $in: [
              "Admin",
              "User",    //aaded by saranya
              // "Ind app without Lender",
              // "Ind app with Lender",
              // "comp with lender",
              // "Comp app without lender",
            ],
          },
        },
        { _id: 0, AppraiserRole: 1 },
        function (err, docs) {
          if (err) {
            logger.log("error", `${err}`);
            res.send(err);
          } else if (docs == " ") {
            console.log("Document not Found");
            res.send(0);
            logger.log("info", `Record not Found`);
          } else {
            console.log("Data", docs);
            res.send(docs);
            logger.log("info", `${docs}`);
          }
        }
      );
    } else if (flag == 1) {
      //Getting Admin role
      collection.find(
        {
          AdminRole: {
            $in: ["Admin"],
          },
        },
        { _id: 0, AdminRole: 1 },
        function (err, docs) {
          if (err) {
            logger.log("error", `${err}`);
            res.send(err);
          } else if (docs == " ") {
            console.log("Document not Found");
            res.send(0);
            logger.log("info", `Record not Found`);
          } else {
            console.log("Data", docs);
            res.send(docs);
            logger.log("info", `${docs}`);
          }
        }
      );
    } else if (flag == 3) {
      // Getting BorrowerRole
      collection.find(
        {
          BorrowerRole: {
            $in: ["User"],
          },
        },
        { _id: 0, BorrowerRole: 1 },
        function (err, docs) {
          if (err) {
            logger.log("error", `${err}`);
            res.send(err);
          } else if (docs == " ") {
            console.log("Document not Found");
            res.send(0);
            logger.log("info", `Record not Found`);
          } else {
            console.log("Data", docs);
            res.send(docs);
            logger.log("info", `${docs}`);
          }
        }
      );
    } else if (flag == 4) {
      // getting Lender role
      collection.find(
        {
          LenderRole: {
            $in: ["Admin", "User"],
          },
        },
        { _id: 0, LenderRole: 1 },
        function (err, docs) {
          if (err) {
            logger.log("error", `${err}`);
            res.send(err);
          } else if (docs == " ") {
            console.log("Document not Found");
            res.send(0);
            logger.log("info", `Record not Found`);
          } else {
            console.log("Data", docs);
            res.send(docs);
            logger.log("info", `${docs}`);
          }
        }
      );
    }
  } catch (err) {
    logger.log("error", `${err}`);
  }
});
module.exports = router;
