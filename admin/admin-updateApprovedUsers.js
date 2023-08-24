var http = require("http");
var express = require("express");
var router = express.Router();
var mailer = require("nodemailer");
var mailService = require("../commonjs/admin-mail");
const bcrypt = require("bcryptjs");
var strEmail = "";
const logger = require("./logger"); //adding loggers
var verifyToken = require("../commonjs/Verify_JWT"); //  To Verify Token

const crypto = require('crypto');
const algorithm = 'aes-256-cbc'; //Using AES encryption
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

router.post("/", verifyToken, function (req, res, next) {
  var existArr = [];
  var jsonObj = req.body;
  flag = 1;

  var db = req.admin_db;
  var collection = db.collection("User");
  var vrSupportMail=process.env.VR_SUPPORT_EMAIL;//assign email from env file .F
  var i = 0;

  insertRow(collection, jsonObj, res, i, existArr);
  function insertRow(collection, jsonObj, res, i, existArr) {
    var CreatedBy = jsonObj[i].UserId;
    var firstname = jsonObj[i].firstname;
    var lastname = jsonObj[i].lastname;
    var email_id = jsonObj[i].emailid;
    var mobile_number = jsonObj[i].phoneNo;
    var addressline1 = jsonObj[i].address1;
    var addressline2 = jsonObj[i].address2;
    var area = jsonObj[i].area;
    var city = jsonObj[i].city;
    var state = jsonObj[i].state;
    var country = jsonObj[i].country;
    var landmark = jsonObj[i].landmark;
    var pincode = jsonObj[i].pincode;
    var companyName = jsonObj[i].companyName;
    var contract_reference = jsonObj[i].contreactRef;
    var password = jsonObj[i].password;
    // var passwrd = jsonObj[i].password;

    var usertype = jsonObj[i].UserType;
    var userRole = jsonObj[i].userrole;
    var general_Flag = jsonObj[i].generalAlert;
    var startdate = jsonObj[i].startDate;
    var enddate = jsonObj[i].endDate;
    var updatedBy = jsonObj[i].lastupdateby;
    // update query taken based on contact details
    var OrgType;
    
    if(startdate != '' && enddate != ''){ 
      startdate = dateformate(startdate)
      enddate = dateformate(enddate)
      var s =startdate.setHours(00,00,00)
      var e =enddate.setHours(23,59,59)
      startdate = new Date(s)
      enddate = new Date(e)
      }

    if (usertype == "Appraiser" && userRole == "Admin") {
      OrgType = "Company"
    }
    else {
      OrgType = "Individual"
    }
    collection.update(
      { "ContactDetails.EmailID": email_id },
      {
        $set: {
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
          OrgType: OrgType,
          CompanyName: companyName,
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
          general_alert_flag: general_Flag,
          UserStatus: "Active",
          LastUpDate: new Date(),
          CreatedBy: CreatedBy,
          last_updated_by: updatedBy,
          ApprovalDetails: {
            Status: "Approved",
          },
        },
      },

      function (err, result) {
        if (err) {
          console.log(err);
          logger.log("error", `${err}`);
        } else {
          var decryptCode = RandomString(25)
          collection.update({ "ContactDetails.EmailID": email_id }, {
            $set: {
              RandomString: decryptCode
            }
          }), function (err, result) {
            if (err) {
            }
            else {
            }
          }
          url = " " + process.env.FORGOT_EMAIL_URL + "=" + decryptCode + ";flag" + "=" + 1
          content = "Dear <b>" + camelize(firstname) + "</b>,<br/><br/> Your account with user name <b>" + email_id + "</b> is approved now !!<br/> Click the url below to activate your account. Use the passcode = <b>" + password + "</b> to activate and successfully set the desired password.<br/><br/>URL :  <a href=" + url + ">" + url + '</a><br/><br/><span>If the above URL does not work try copying and pasting it into your browser. <br/>Please feel free to reach our support team using <a href="mailto:'+ vrSupportMail +'?subject=Customer%20Support&amp;body=This is my body text">vrsupport@valurite.in</a>, in case of any issues.<br/><br/> Thanking you. <br/>ValuRite Team <br /><br />*** This is an automatically generated email, please do not reply ***'
          //change the email support@valurite.in to vrsupport@valurite.in and get from vrSupportMail .F
          console.log("Mail sending....");
          // tomail = "praveen.yonass@analyticbrains.com";
          var collection2 = db.collection('Company')
          collection2.find({ "CompanyName": companyName }, function (err, docs) {
            if (err) {
              console.log(err)
            }
            else {
              ccMail = docs[0].Contact_details.filter((val) => { return val.type == "Primary" })[0]['email_id']
              mailService(email_id, "User Approved !!", content, ccMail);
            }
          })
        }

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

function RandomString(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

function dateformate(date){

  var a = date.split('-')
  a = a[1] + '-' + a[0]+ '-'+a[2]
  return new Date(a);
}

module.exports = router;
