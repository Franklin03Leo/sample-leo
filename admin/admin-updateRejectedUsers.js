/* Update the User records with reject status in 'user' collection */
var http = require("http");
var express = require("express");
var router = express.Router();
var mailService = require("../commonjs/admin-mail");
router.post("/", function (req, res, next) {
  var jsonObj = req.body;
  var existArr = [];
  var db = req.admin_db;
  var collection = db.collection("User");
  var i = 0;

  insertRow(collection, jsonObj, res, i, existArr);

  function insertRow(collection, jsonObj, res, i, existArr) {
    var firstname = jsonObj[i].firstname;
    var email_id = jsonObj[i].emailid;
    var comments = jsonObj[i].comments;
    var updatedBy = jsonObj[i].lastupdateby;
    collection.update(
      { "ContactDetails.EmailID": email_id },
      {
        $set: {
          lastUpdatedBy: updatedBy,
          LastUpDate: new Date(),
          UserStatus: "InActive",
          ApprovalDetails: {
            Status: "Rejected",
          },
          Comment: comments,
        },
      },

      function (err, result) {
        if (err) {
          console.log(err);
        } else {
          content =
            "Dear <b>" +
            camelize(firstname) +
            "</b>,<br/><br/> Your registration has been <b>Rejected</b> for the following reason.<br>Reason for Rejection : " +
            comments +
            "<br/><br/> Thanking you. <br/>ValuRite Team <br/><br />*** This is an automatically generated email, please do not reply ***";
          
          mailService(email_id, "Your request for user registration is Rejected !!", content,'');
        }
        //  If emailflag is true, then email will be sent the respective users

        if (i < jsonObj.length - 1) {
          insertRow(collection, jsonObj, res, ++i, existArr);
        } else {
          res.send("1");
        }
      }
    );
  }
});

//VRR-692 check condition when string comes undefind show an error
function camelize(str) {
  if(str != undefined && str != null){
    return str.split(' ')
    .map(a => a.trim())
    .map(a =>{
      if(a[0] != undefined ){
        a[0].toUpperCase() + a.substring(1)
      }
    }).join(" ")
  }
}
  
module.exports = router;
