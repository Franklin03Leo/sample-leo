// Update the company details
var express = require("express");
var path = require("path");
const logger = require("./logger"); //adding loggers
var updaterouter = express.Router();
var mailService = require("../commonjs/admin-mail"); //import for email
var verifyToken = require("../commonjs/Verify_JWT"); //  To Verify Token
updaterouter.post("/", verifyToken, function (req, res) {
  try {
    //db connection establishment
    const db = req.admin_db;
    const coll = db.collection("Company");
    const emailIDArray = [];
    const SecondaryEmailIdarr = [];
    var temparray = [];
    var strEmail = "";
    //Empty the contract details when company name is lender.
    if (req.body.companyType == "Lender") {
      // req.body.contractdetails = null   //comment By franklin
      req.body.bank_Holder_Name = null;
      req.body.ifsc_Code = null;
      req.body.micr_Code = null;
      req.body.bank_Name = null;
      req.body.branch_Name = null;
      req.body.account_Number = null;
    }

    for (let contactDetails of req.body.contactdetails) {
      if (contactDetails.type == "Primary") {
        emailIDArray.push(contactDetails.email_id);
      }
      if (contactDetails.type == "Secondary") {
        SecondaryEmailIdarr.push(contactDetails.email_id);
      }
    }
    // String building of email id's with ';' seperation
    strEmail = "";
    SecondarystrEmail = "";
    emailIDArray.forEach(function (i) {
      strEmail = strEmail + i + ";";
    });
    SecondaryEmailIdarr.forEach(function (i) {
      SecondarystrEmail = SecondarystrEmail + i + ";";
    });

    //initialize the 'branchMail' array to store the Emails
    let branchMail = [];
    // map the primary mail from BranchDetails
    req.body.branchDetils.map((val) => {
      val.branchcontract.map((value) => {
        if (value.type == "PrimaryVal") branchMail.push(value.email);
      });
    });
    //push the contact Mail-id to BranchMail array
    branchMail.push(strEmail);

    var companyname = req.body.companyname;
    // Update Query for updating company details in company collection, with respect to the companyname as a key
    coll.update(
      { CompanyName: req.body.companyname },
      {
        $set: {
          CompanyName: req.body.companyname,
          CompanyType: req.body.companyType,
          GstNumber: req.body.gstnumber,
          PanNumber: req.body.panNum,
          CompanyDescription: req.body.companydesc,
          Address: {
            AddressLine1: req.body.companyaddress,
            City: req.body.cities,
            State: req.body.states,
            Country: req.body.countries,
            Pincode: req.body.zipcode,
          },
          Contact_details: req.body.contactdetails,
          Contract: {
            Contract_reference: req.body.contractdetails,
          },
          Bank_Details: {
            bank_Holder_Name: req.body.bank_Holder_Name,
            ifsc_Code: req.body.ifsc_Code,
            micr_Code: req.body.micr_Code,
            bank_Name: req.body.bank_Name,
            branch_Name: req.body.branch_Name,
            account_Number: req.body.account_Number,
          },
          CompanyBranchDetails: req.body.branchDetils,
          CompanyWithBranch: req.body.branchesCompanyes,
          CompanyLogo: req.body.companyLogo,
          LastUpDate: new Date(),
        },
      },
      function (err, update) {
        if (update) {
          var logobj = {}; //object initialization
          logobj.UserIDpdate = req.body.lastupdatedby; //adding userid to object
          logobj.Data = update; //adding data to object
          // res.json(update);
          //res.send("1");
          content =
            "<p>Dear Sir/Madam,</p> Your Company <b>" +
            companyname +
            "</b> details are updated successfully. <br/><p>Regards, <br>Valurite Support Team</p><br/>    *** This is an automatically generated email, please do not reply ***";
          //("content"+content)

          //   console.log("stremail"+strEmail)
          mailService(
            branchMail,
            "Company Updated Successfully !!",
            content,
            SecondarystrEmail
          ); //cheange ✔ to !! .F
          var logobj = {}; //object initialization
          logobj.UserIDpdate = "User"; //req.body.lastupdatedby;//adding userid to object
          logobj.Data = "Mail Sent"; //adding data to object
          //  res.send("1");
          res.send("1");
        }
        if (err) {
          //console.log('Error in updating company details' +err);
          logger.log("error", `${err}`); //logger error - added by SRINIVASAN
          res.send("3");
        }
      }
    );
  } catch (err) {
    logger.log("error", `${err}`); //logger error - added by SRINIVASAN
  }
});

module.exports = updaterouter;
