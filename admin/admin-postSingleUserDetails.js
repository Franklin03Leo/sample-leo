/* Insert data into User collection (Single User) */
var http = require("http");
var fs = require("fs");
var express = require("express");
var nodemailer = require("nodemailer");
var router = express.Router();
var logger = require("./logger"); //adding logger
const bcrypt = require("bcryptjs");
var mailService = require("../commonjs/admin-mail");
var verifyToken = require("../commonjs/Verify_JWT"); //  To Verify Token
require('dotenv').config({path: "../.env"})
var vrSupportMail = '';
router.post("/", verifyToken, function (req, res) {
  //DB Connection and its parameters

  var jsonObj = req.body;
  var firstname = jsonObj.firstname;
  var lastname = jsonObj.lastname;
  var email_id = jsonObj.emailid;
  var mobile_number = jsonObj.phonenumber;
  var addressline1 = jsonObj.addressLine1;
  var addressline2 = jsonObj.addressLine2;
  var country = jsonObj.country;
  var state = jsonObj.state;
  var city = jsonObj.city;
  var area = jsonObj.area;
  var landmark = jsonObj.landMark;
  var pincode = jsonObj.pincode;
  var companyname = jsonObj.companyname;
  var contract_reference = jsonObj.contractRefrence;
  var usertype = jsonObj.userType;
  var userRole = jsonObj.userRole;
  var startdate = new Date(jsonObj.sDate);
  var enddate = new Date(jsonObj.eDate);
  var updatedBy = jsonObj.lastUpdatedby;
  var generalalert = jsonObj.generalAlerts;
  var Association = req.body.AssociationName;
  var OrgType = jsonObj.orgtype;
  var ReferralCode=jsonObj.ReferralCode;
  var URL;
  if (jsonObj.password == jsonObj.rePassword) {
    var password = jsonObj.password;
  }
  vrSupportMail=process.env.VR_SUPPORT_EMAIL;//assign email from env file .F
  var db = req.admin_db;
  var collection = db.collection("User");
  
  //DB Query
  try {

if(usertype=='Admin'||usertype=='Appraiser')
{
    collection.insert(
      {
        FirstName: firstname,
        LastName: lastname,
        UserID: email_id,
        PasswordDetails: {
          Password: bcrypt.hashSync(password, 10),
          update_password: "true",
          last_updated_date: new Date(),
        },

        UserRole: userRole,
        UserType: usertype,
        CompanyName: companyname,
        ContactDetails: {
          MobileNo: mobile_number,
          EmailID: email_id,
        },
        Address: {
          AddressLine1: addressline1,
          AddressLine2: addressline2,
          AddArea: area,
          City: city,
          State: state,
          Country: country,
          Pincode: pincode,
          Landmark: landmark,
        },
        Contract: {
          ContractReference: contract_reference,
          StartDate: startdate,
          EndDate: enddate,
        },
        general_alert_flag: generalalert,
        UserStatus: "Active",
        CreatedDate: new Date(),
        LastUpDate: new Date(),
        lastUpdatedBy: updatedBy,
        CreatedBy:updatedBy,
        ApprovalDetails: {
          Status: "Approved",
        },
        OrgType: OrgType,
      //  ReferredBy:process.env.ReferredBy,
        AssociationDetails: Association,
        UserName: firstname + " " + lastname,
        ReferralCode:ReferralCode
      },
      function (err, docs) {
        if (err) {
          console.log(err);
          res.send(err);
          logger.log("error", `${err}`);
        } else {

          if(usertype=='Admin' || usertype=='Appraiser' )
          {
          //   content =
          //   "Dear <b>" +
          //   firstname +
          //   "</b>,<br/><br/> You have registered successfully";
          // }
          // else{
if(ReferralCode==null||ReferralCode=="")
URL=process.env.LOGIN_URL
else
             URL=process.env.LOGIN_URL+'r/'+ReferralCode
            console.log("URL"+URL)
            var db=req.admin_db;
            var coll3 = db.get('Company');
            var copyTo;
            var ccmail;
            // var Companyname = companyname
            coll3.find({ 'CompanyName': companyname }, function (err, results) {
              if (err) {var logobj = {};
                     logobj.UserID = UserID;
                     logobj.info = err;
                     logger.log('error', `${JSON.stringify(logobj)}`);
               
                     console.log(err);
                     res.send("0"); }
              else if (results.length) {
                console.log("email***********" + JSON.stringify(results))   
                for (i = 0; i < results[0].Contact_details.length; i++) {
                  if (results[0].Contact_details[i].type == 'Primary') {
                     copyTo = results[0].Contact_details[i].email_id;
                    //  ccmail = copyTo
                   }
               }
              }
            else { copyTo = ''; }
            var username = firstname + " " + lastname
            var bcc = 1
            username = camelize(username)
          content =
            " Dear <b>" +
            //username +"</b>,<br/> Welcome to ValuRite !! You are ready to use the product with the following credentials. <br/><br/> <b>User Name : " + email_id + "</b><br><b>Password : " + password + "</b></br><br> Please login using the below URL: </br><br> <a href="+ URL +">Click here</a></br><br> Note: You will be requested to change the password on first login attempt. </br> If the above URL does not work try copying and pasting it into your browser. <br></br> Please feel free to reach our support team using <a href='mailto:support@valurite.in?subject=Customer%20Support&amp;body=This is my body text'>support@valurite.in</a>, in case of any issues.<br/><br>Thank you <br/>ValuRite Team <br /><br>*** This is an automatically generated email, please do not reply ***"; //content is not appropriate so changed and mail also.. by .F
            username +"</b>,<br><br/><b><span style='font-size:16px'>&emsp;&emsp; Welcome to ValuRite !!</span></b> You are ready to use the product with the following credentials. <br/><br/> <b>User Name : " + email_id + "</b><br><b>Password : " + password + "</b></br><br> Please <a href="+ URL +">Click here</a> to login to ValuRite.You can also copy paste the below URL in your browser.</br><br> URL : <a href=https://app.valurite.in/>https://app.valurite.in/ </a><br><br> Note : You will be requested to change the password on your first login attempt. </br> If the above URL does not work, please feel free to reach our support team using <a href='mailto:"+ vrSupportMail +"?subject=Customer%20Support&amp;body=This is my body text'>vrsupport@valurite.in</a>, in case of any queries.<br/><br>Thank you. <br/>ValuRite Team <br /><br>*** This is an automatically generated email, please do not reply ***";
          console.log("Mail sending....");
          mailService(email_id, `Your ValuRite Login Created Successfully !!`, content, copyTo, '',bcc);
        }
            )};
          try {
            res.send("1");
            logger.log("info", `Registration Successful...`);
          } catch (error) {
            logger.log("error", `${error}`);
          }
        }
        function camelize(str) {
          return str.split(' ')
          .map(a => a.trim())
          .map(a => a[0].toUpperCase() + a.substring(1))
          .join(" ")
          }
      }
    );
}
else if(usertype=='Borrower'||usertype=='Lender')
{
  collection.insert(
    {
      FirstName: firstname,
      LastName: lastname,
      UserID: email_id,
      UserRole: userRole,
      UserType: usertype,
      CompanyName: companyname,
      ContactDetails: {
        MobileNo: mobile_number,
        EmailID: email_id,
      },
      Address: {
        AddressLine1: addressline1,
        AddressLine2: addressline2,
        AddArea: area,
        City: city,
        State: state,
        Country: country,
        Pincode: pincode,
        Landmark: landmark,
      },
     
      UserStatus: "Active",
      CreatedDate: new Date(),
      LastUpDate: new Date(),
      lastUpdatedBy: updatedBy,
      ApprovalDetails: {
        Status: "Approved",
      },
      OrgType: OrgType,
    //  ReferredBy:process.env.ReferredBy,
      ReferralCode:ReferralCode,
      UserName: firstname + " " + lastname,
    },
    function (err, docs) {
      if (err) {
        console.log(err);
        res.send(err);
        logger.log("error", `${err}`);
      } else {
        try {
          res.send("1");
          logger.log("info", `Registration Successful...`);
        } catch (error) {
          logger.log("error", `${error}`);
        }
      }
    }
  );
}
  } catch (ex) {
    logger.log("error", `${ex}`);
    console.dir(ex);
  }
});
module.exports = router;
