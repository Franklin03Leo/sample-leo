/* Update Bulk data in 'user' collection */
var express = require('express');
var router = express.Router();
var arrypush = [];
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.post('/',verifyToken, function (req, res, next) {
  var jsonObj = req.body;
  var length = jsonObj.length;
  var dbhit = 0;
  try {
    var db = req.admin_db;
    var collection = db.collection('user');

    var i = 0;
      // Method for updating the data one after another 
    insertRow(collection, jsonObj, res, i);
    res.send(arrypush);
  }
  catch (ex) {
    console.dir(ex);
    var obj = {
      status: 'error'
    }
    var arr = JSON.stringify(obj);
    console.log(arr)
    // res.send(arr);
  }
});

function insertRow(collection, jsonObj, res, i) {
  var firstname = jsonObj[i].first_name;
  var lastname = jsonObj[i].last_name;
  var email_id = jsonObj[i].email_id;
  var ph_number = jsonObj[i].phone_number;
  var department = jsonObj[i].department;
  var area_of_interest = jsonObj[i].area_of_interest;
  var company_institute = jsonObj[i].companyname;
  var contract_reference = jsonObj[i].contractref;
  var general_flag = JSON.parse(jsonObj[i].generalflag);
  var startDate = new Date(jsonObj[i].startdate);
  var endDate = new Date(jsonObj[i].enddate);
  var usertype = jsonObj[i].userType;
  var userStatus = jsonObj[i].user_Status;
  var updatedBy = jsonObj[i].last_updated_by;
  var deletedate = jsonObj[i].user_Status == 'InActive' ? new Date() : '';
  // Query for updation 
  collection.update({ 'contact_details.email_id': email_id },
    {
      $set: {
        "first_name": firstname,
        "last_name": lastname,
        "contact_details": {
          "phone_number": ph_number,
          "email_id": email_id
        },
        "department": department,
        "company_institute": company_institute,
        "area_of_interest": area_of_interest,
        "general_alert_flag": general_flag,
        "rolename": usertype,
        "contract.contract_reference": contract_reference,
        "contract.start_date": startDate,
        "contract.end_date": endDate,
        "user_status": userStatus,
        "last_updated_by": updatedBy,
        "last_updated_date": new Date(),
        "user_deleted_date": deletedate
      }
    },

    function (err, result) {
      if (err) {
        console.log(err);
      }
      else {
        arrypush.push(result);
      }
    });
    //  Loops till the condition is satisfied
  if (i < jsonObj.length - 1) {
    insertRow(collection, jsonObj, res, ++i);
  }
}
module.exports = router;

