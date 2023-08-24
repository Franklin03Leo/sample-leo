var express = require("express");
const bcrypt = require("bcryptjs");
var date = require("date-and-time");

const logger = require("./logger");   //adding loggers
var router = express.Router();

router.post("/", function (req, res, next) {
  
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
      formattedDate = year + "" + (month < 10 ? "0" : "") + month + "" + (day < 10 ? "0" : "") + day;
      return formattedDate;
    }

  try {
    var strBody = req.body;
    var jsonObj = strBody;
    var EmailID = jsonObj.username;
    var sessionID = jsonObj.sessionID;
    var param = jsonObj.param;
    if (!EmailID) {
      return res.status(404).send('Invalid');
    }
    const db = req.admin_db;
    var collection = db.collection("Userlogs");
    var usercollection = db.collection("User");

    var query = {};
    if (param == 'loginSession') {
      query = { 'email_id': EmailID, 'logout_time': null };
      collection.find(query, function (err, docs) {
        res.send(docs);
        res.end();
      });
    }
    if (param == 'logoutSession') {
      query = { 'session_id': sessionID, 'logout_time': { $ne: null } }
      collection.find(query, function (err, docs) {
        res.send(docs);
        res.end();
      });
    }
    if (param == 'updateActiveSession') {
      collection.update(
        { email_id: EmailID, session_id: sessionID, logout_time: { $eq: null } },
        { $set: { active_session_time: new Date() } },
        { multi: true }
      ).then((docs)=>{
        res.send(docs);
        res.end();  
      }).catch((err)=>{
          console.log('err'+ err)
      });
    }

    // to check whether the user is Valid before killing the current session
    if (param == 'loginValid') {
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
            ReferralCode: "$ReferralCode"
          },
        },
      ];
      usercollection.aggregate(query, function (err, docs) {
        if (err) {
          var obj = [{status:'Invalid'}];
          return res.status(res.statusCode).send(obj);
        } else {
          if (docs == "" || docs == undefined) {
            var obj = [{status:'Invalid'}];
            return res.status(res.statusCode).send(obj);
          }
          else if (docs[0].approval_status != "Approved") {
            var obj = [{status:'Invalid'}];
            return res.status(res.statusCode).send(obj);
          }
          else {
            var doc = docs[0];

            var decrypt_password = bcrypt.compareSync(
              sessionID,
              doc.user_password
            );
            var today = new Date();
            var tdymonth = today.getMonth() + 1;
            var tdyday = today.getDate();
            var tdyyear = today.getFullYear();
            var tddate = tdyyear + "" + (tdymonth < 10 ? "0" : "") + tdymonth + "" + (tdyday < 10 ? "0" : "") + tdyday;
            var spliteddate = parseInt(tddate);

            var userstDate = dateformat(doc.user_start_date);
            var useredDate = dateformat(doc.user_end_date);

            if (!decrypt_password) {
              var obj = [{status:'Invalid'}];
              return res.status(res.statusCode).send(obj);
            }

            else if (parseInt(userstDate) > spliteddate || parseInt(useredDate) < spliteddate) {
              var obj = [{status:'Invalid'}];
              return res.status(res.statusCode).send(obj);
            }
            else if (doc.user_status === "InActive") {
              var obj = [{status:'Invalid'}];
              return res.status(res.statusCode).send(obj);
            }
            else if (doc.updatetime.length > 0) {
              if (date.subtract(today, doc.updatetime[0].session_update_time).toSeconds() < 15) {
                var obj = [{status:'Invalid'}];
                return res.status(res.statusCode).send(obj);
              }
              else {
                var obj = [{status:'Valid'}];
                return res.status(res.statusCode).send(obj);
              }
            }
            else if (doc.updatetime.length == 0) {
              if (doc.max_allowed_logins < doc.logged_in_users) {
                var obj = [{status:'Invalid'}];
                return res.status(res.statusCode).send(obj);
              }
              else {
                var obj = [{status:'Valid'}];
                return res.status(res.statusCode).send(obj);
              }
            }
            else {
              var obj = [{status:'Invalid'}];
              return res.status(res.statusCode).send(obj);
            }
          }
        }
      });
    }


  } catch (ex) {
    logger.log('error', `${ex}`);  // logging error into DB
    console.log(ex);
  }
});
module.exports = router;