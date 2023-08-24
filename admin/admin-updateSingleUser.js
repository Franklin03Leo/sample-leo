/* Update the user details (Single user) */
var express = require('express');
var router = express.Router();
var logger= require('./logger'); //adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.post('/',verifyToken, function (req, res, next) {
    //DB Connection and its parameters
    try {
    var jsonObj = req.body;
    var email_id = jsonObj.emailid;
    var FirstName = jsonObj.firstname;
    var LastName = jsonObj.lastname;
    var Compname = jsonObj.companyName;
    var userType = jsonObj.userType;
    var MobileNo = jsonObj.mobileNo;
    var Address1 = jsonObj.address1;
    var Address2 = jsonObj.address2;
    var Country = jsonObj.country;
    var City = jsonObj.city;
    var State = jsonObj.state;
    var Area = jsonObj.area;
    var Landmark = jsonObj.lanmark;
    var Pincode = jsonObj.pincode;
    var contracRef = jsonObj.contarctRef;
    var userRole = jsonObj.userRole;
    var OrgType=jsonObj.OrgType;              //added by saranya
    var alertGeneral =jsonObj.galerts
    var startDate = new Date(jsonObj.sDate);
    var endDate = new Date(jsonObj.eDate);
    var status = jsonObj.status;
    var Association = jsonObj.Association;
    // var updatedby = jsonObj.last_updated_by;
    var deletedate = status == 'InActive' ? new Date() : '';
    var db = req.admin_db;
    var collection = db.collection('User');
        //DB Query
        collection.update({ "ContactDetails.EmailID": email_id },
            {
                $set:
                    {
                        "FirstName": FirstName,
                        "LastName": LastName,
                        "UserID": email_id,
                        "UserRole": userRole,
                        "OrgType":OrgType,                           //added by saranya
                        "UserType": userType,
                        "CompanyName": Compname,
                        "ContactDetails": {
                            "MobileNo": MobileNo,
                            "EmailID": email_id
                        },
                        "Address" : {
                            "AddressLine1" : Address1,
                            "AddressLine2" : Address2,
                            "AddArea" : Area,
                            "City" : City,
                            "State" : State,
                            "Country" : Country,
                            "Pincode" : Pincode,
                            "Landmark" : Landmark
                        },
                        "Contract": {
                            "ContractReference": contracRef,
                            "StartDate": startDate,
                            "EndDate": endDate,
                        },
                        "general_alert_flag": alertGeneral,
                        "UserStatus": status,
                        "LastUpDate": new Date(),
                        "userDeleted_Date": deletedate,
                        "AssociationDetails" : Association,
                        "UserName" : FirstName+" "+LastName
                    }
            },
            function (err, docs) {
             if(err)
             {
                logger.log('error',`${err}`);
             }
             else{
                 res.send("1");
                logger.log('info',`Updated successfully`); // Logging data into DB   
             }
          })
    }
    catch (ex) {
        logger.log('error',`${ex}`); //error logger
        console.dir(ex);
    }
});

module.exports = router;

