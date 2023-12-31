var express = require("express");
var date = require("date-and-time");
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
var logger= require('./logger');   //adding logger
router.post("/", function (req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(404).send("ErrorMsg : Request body is not found");
  }

  //Method to encrypt the password
  function decrypt(pass) {
    var cryptLib = require("cryptlib"),
      iv = "rv6Isv_BpSFBrB2V"; //cryptLib.generateRandomIV(16), //16 bytes = 128 bit
    key = "b16920894899c7780b5fc7161560a412"; //cryptLib.getHashSha256('my secret key', 32), //32 bytes = 256 bits
    originalText = cryptLib.decrypt(pass, key, iv);
    return originalText;
  }
  //method for converting dateformat for today,month,year and day
  function dateformat(date) {
    var formattedDate = "";
    var todayTime = new Date(date);
    var month = todayTime.getMonth() + 1;
    var day = todayTime.getDate();
    var year = todayTime.getFullYear();
    formattedDate =
      year +
      "" +
      (month < 10 ? "0" : "") +
      month +
      "" +
      (day < 10 ? "0" : "") +
      day;
    return formattedDate;
  }

  function sessionid() {
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    sessionid = "";
    for (x = 0; x < 8; x++) {
      i = Math.floor(Math.random() * 62);
      sessionid += chars.charAt(i);
    }
    return sessionid;
  }
  //DB connection and and its query
  try {
    var strBody = req.body;
    var jsonObj = strBody;
    //	var EmailID = req.body.username;
    var EmailID = req.body.username;
    var pwd = req.body.password;
    const db = req.admin_db;
    var collection = db.collection("User");
    var logcollection = db.collection("Userlogs");

    var query = [
      { $match: { "ContactDetails.EmailID": EmailID } },
      {
        $lookup: {
          from: "Contracts",
          localField: "Contract.ContractReference",
          foreignField: "contract_reference",
          as: "contract_docs",
        },
      },
      { $unwind: { path: "$contract_docs", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "User",
          localField: "CompanyName",
          foreignField: "CompanyName",
          as: "company_docs",
        },
      },
      {
        $lookup: {
          from: "Userlogs",
          localField: "company_docs.ContactDetails.EmailID",
          foreignField: "email_id",
          as: "log_docs",
        },
      },
      {
        $project: {
          updatetime: {
            $filter: {
              input: "$log_docs",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.email_id", EmailID] },
                  { $lte: ["$$item.logout_time", 0] },
                ],
              },
            },
          },
          logged_in_users: {
            $subtract: [
              { $size: "$log_docs.login_time" },
              { $size: "$log_docs.logout_time" },
            ],
          },
          email_id: "$ContactDetails.EmailID",
          rolename: "$UserRole",
          first_name: "$FirstName",
          user_password: "$PasswordDetails.Password",
          update_password: "$PasswordDetails.update_password",
          company_institute: "$CompanyName",
          OrgType: "$OrgType",
          user_end_date: "$Contract.EndDate",
          user_start_date: "$Contract.StartDate",
          approval_status: "$ApprovalDetails.Status",
          max_allowed_logins: "$contract_docs.max_allowed_logins",
          general_alert_flag: "$general_alert_flag",
          user_status: "$UserStatus",
          user_id: "$UserID",
          usertype: "$UserType",
          status: "$status",
          ReferralCode:"$ReferralCode"
        },
      },
    ];
    collection.aggregate(query, function (err, docs) {
      var obj = {};
      var arr = [];
      var result = [];
      var obj2 = {};
      if (err) {
        obj = {
          status: "Error",
          errorMsg: "Errror in retrieving data from DB",
        };
        return res
          .status(res.statusCode)
          .send("There was a problem finding the user.");
      } else {
        if (docs == "" || docs == undefined) {
          obj2={result:""}
          obj = { status: "Not Exists", errorMsg: "Invalid User data", result:obj2 };
          var arr = JSON.stringify(obj);
          // logger.log('info',`${JSON.stringify(obj)}`);  // logging data into DB
          res.status(res.statusCode).send(arr);
          res.end();
        } else if (docs[0].approval_status != "Approved") {
          obj = { status: "Not Approved", errorMsg: "User is not approved" };
          arr = obj;
          res.status(res.statusCode).send(arr);
          res.end();
        } 
        else {
          var doc = docs[0];
          var decrypt_password = bcrypt.compareSync(
            req.body.password,
            doc.user_password
          );
          //console.log(decrypt_password);
          var today = new Date();
          var tdymonth = today.getMonth() + 1;
          var tdyday = today.getDate();
          var tdyyear = today.getFullYear();
          var tddate =
            tdyyear +
            "" +
            (tdymonth < 10 ? "0" : "") +
            tdymonth +
            "" +
            (tdyday < 10 ? "0" : "") +
            tdyday;
          var spliteddate = parseInt(tddate);
          var userstDate = dateformat(doc.user_start_date);
          var useredDate = dateformat(doc.user_end_date);
		  //jwt token generation
          const token = jwt.sign(
            {
              UserID: doc.user_id,
            },//payload
            "secret",//secret string(can be any string)
            { expiresIn: "1w" }//one week expire period for the token
          );
          //condition to check password validations,approval,contract and log in status
          if (!decrypt_password) {
            obj2={
              usertype:""
            }
            obj = { 
              status: "In Valid", 
              errorMsg: "Incorrect password",
              result:obj2
          
          };
            arr = obj;
            res.status(res.statusCode).send(arr);
            res.end();
          } 
          // else if (doc.approval_status != "Approved") {
          //   obj = { status: "Not Approved", errorMsg: "User is not approved" };
          //   arr = obj;
          //   res.status(res.statusCode).send(arr);
          //   res.end();
          // } 
          // else if (doc.update_password === "false") {
          //   obj2 = {
          //      userID :doc.user_id,
          //     name: doc.first_name,
          //     updatepassword: doc.update_password,
          //     rolename: doc.rolename,
          //     usertype: doc.usertype,
          //     companyname: doc.company_institute,
          //   };
          //   obj = {
          //     status: "First Time User",
          //     errorMsg: "User Login for the first time 1",
          //     result: obj2,
          //     token: token,
          //   };
          //   arr = obj;
          //   logger.log('info',`${JSON.stringify(arr)}`);  // logging data into DB
          //   res.status(res.statusCode).send(arr);
          //   res.end();
          // } 
          else if (
            parseInt(userstDate) > spliteddate ||
            parseInt(useredDate) < spliteddate
          ) {
            obj = {
              status: "Contract Expired",
              errorMsg: "Contract date is expired for the user",
            };
            arr = obj;
            // logger.log('info',`${JSON.stringify(arr)}`);  // logging data into DB
            res.status(res.statusCode).send(arr);
            res.end();
          } else if (doc.user_status === "InActive") {
            obj = { status: "In Active", errorMsg: "User status is Inactive" };
            arr = obj;
            res.status(res.statusCode).send(arr);
            res.end();
          } else if (doc.updatetime.length > 0) {
            // console.log(doc.updatetime.length + "Update_Length");
            if (
              date
                .subtract(today, doc.updatetime[0].session_update_time)
                .toSeconds() < 15
            ) {
              obj = {
                status: "Already Logged In",
                errorMsg: "The given user is already logged in",
              };
              arr = obj;
              // logger.log('info',`${JSON.stringify(arr)}`);  // logging data into DB
              res.status(res.statusCode).send(arr);
              res.end();
            }
            // else if (doc.max_allowed_logins < doc.logged_in_users - 1) {
            // 	obj = { status: 'Max Logins Reached',
            // 	errorMsg : "Number of session count exceeds"

            //  }
            // 	arr = obj;
            // 	res.status(200).send(arr);
            // 	res.end();
            // }
            else {
              logcollection.update(
                { email_id: EmailID, logout_time: { $eq: null } },
                {
                  $set: { logout_time: doc.updatetime[0].session_update_time },
                },
                { multi: true },
                function (err2, docs2) {
                  if (err2) console.warn(err.message);
                  else {
                    var session_id = sessionid();
                    logcollection.insert({
                      session_id: session_id,
                      email_id: EmailID,
                      login_time: today,
                      session_update_time: today,
                      "created date": today,
                      local_ip: jsonObj.localIp,
                      global_ip: jsonObj.globalIp,
                      city_name: jsonObj.city,
                      country_name: jsonObj.country,
                    });
                    obj2 = {
                      session_id: session_id,
                      name: doc.first_name,
                      rolename: doc.rolename,
                      companyname: doc.company_institute,
                      username: doc.email_id,
                      userid: doc.user_id,
                      general_alert_flag: doc.general_alert_flag,
                      userID: doc.user_id,
                      usertype: doc.usertype,
                      status: doc.status,
                      OrgType: doc.OrgType,
                      ReferralCode:doc.ReferralCode
                    };
                    obj = {
                      status: "Valid",
                      Msg: "Given user data are valid - Successfully LoggedIn",
                      result: obj2,
                      token: token,
                    };
                    arr = obj;
                    // logger.log('info',`${JSON.stringify(arr)}`);  // logging data into DB
                    res.status(res.statusCode).send(arr);
                    res.end();
                  }
                }
              );
            }
          } else if (doc.updatetime.length == 0) {
            // console.log('check -',doc )
            // || (date.subtract(new Date(), subdoc.updatetime[0].session_update_time).toSeconds() > 15)
            if (doc.max_allowed_logins < doc.logged_in_users + 1) {
              obj = {
                status: "Max Logins Reached",
                errorMsg: "Number of session count exceeds",
              };
              arr = obj;
              // logger.log('info',`${JSON.stringify(arr)}`);  // logging data into DB
              res.status(res.statusCode).send(arr);
              res.end();
            } else {
              var session_id = sessionid();
              logcollection.insert({
                session_id: session_id,
                email_id: EmailID,
                login_time: today,
                session_update_time: today,
                "created date": today,
                local_ip: jsonObj.localIp,
                global_ip: jsonObj.globalIp,
                city_name: jsonObj.city,
                country_name: jsonObj.country,
              });
              obj2 = {
                session_id: session_id,
                name: doc.first_name,
                rolename: doc.rolename,
                companyname: doc.company_institute,
                username: doc.email_id,
                general_alert_flag: doc.general_alert_flag,
                userID: doc.user_id,
                usertype: doc.usertype,
                status: doc.status,
                OrgType: doc.OrgType,
                ReferralCode:doc.ReferralCode
              };
              obj = {
                status: "Valid",
                Msg: "Given user data are valid - Successfully LoggedIn",
                result: obj2,
                token: token,
              };
              arr = obj;
              // logger.log('info',`${JSON.stringify(arr)}`);  // logging data into DB
              res.status(res.statusCode).send(arr);
              res.end();
            }
          } else {
            obj = { status: "Error", errorMsg: "Conditions are not satisfied" };
            arr = obj;
             logger.log('error',`${JSON.stringify(arr)}`);  // logging data into DB
            res.status(res.statusCode).send(arr);
            res.end();
          }
        }
      }
    });
  } catch (ex) {
    logger.log('error',`${ex}`);  // logging error into DB
    console.log(ex);
  }
});
module.exports = router;
