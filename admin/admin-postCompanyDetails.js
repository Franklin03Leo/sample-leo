var http = require("http");
var express = require("express");
var path = require("path");
var app1router = express.Router();
var mailService = require("../commonjs/admin-mail"); //import for email
var strEmail = "";
var firstName = "";
var SecondarystrEmail = "";
var vrSupportMail = "";
var logger = require("./logger"); //adding logger
var verifyToken = require("../commonjs/Verify_JWT"); //  To Verify Token
const doc = require("pdfkit");
app1router.post("/", verifyToken, function (req, res) {
  vrSupportMail = process.env.VR_SUPPORT_EMAIL; //assign email from env file
  try {
    const emailIDArray = [];
    const SecondaryEmailIdarr = [];
    //logger.log('testing',`${JSON.stringify(req.body)}`);
    // Pushing the email id's in array
    for (let contactDetails of req.body.contactdetails) {
      if (contactDetails.type == "Primary") {
        emailIDArray.push(contactDetails.email_id);
        if(contactDetails.name!=undefined)
        {
          console.log("str"+contactDetails.name)
          firstName = camelize(contactDetails.name);
        }
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

    //DB Connection and its query
    const db = req.admin_db;
    const coll = db.collection("Company");
    //Empty the contract details when company name is lender.
    if (req.body.companyType == "Lender") {
      // req.body.contractdetails = null
      req.body.bank_Holder_Name = null;
      req.body.ifsc_Code = null;
      req.body.micr_Code = null;
      req.body.bank_Name = null;
      //   req.body.branch_Name = null;
      req.body.account_Number = null;
    }
    coll.insert(
      {
        CompanyName: req.body.companyname,
        CompanyType: req.body.companyType,
        GstNumber: req.body.gst_num,
        PanNumber: req.body.panNum,
        CompanyLogo: req.body.companyLogo,
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
        CreatedDate: new Date(),
        LastUpDate: new Date(),
        last_updated_by: req.body.lastUpdatedValue,
      },
      function (err, docs) {
        if (err) {
        } else {
          try {
            // const content = '<p>Dear ' + firstName + ',</p> Your company <b>' + req.body.companyname + '</b> is registered successfully in ValuRite!! Your administrator user credentials will be sent to you shortly. <br/><br>Please feel free to reach our support team using <a href="mailto:valuriteab@gmail.com?subject=Customer%20Support&amp;body=This is my body text">valuriteab@gmail.com</a>, in case of any issues.<br/><br><p>Thanking you.</br> <br>ValuRite Team</p></br>    *** This is an automatically generated email, please do not reply ***';
            const content =
              "<p>Dear " +
              firstName +
              ",</p> Your company <b>" +
              req.body.companyname +
              '</b> is registered successfully in ValuRite!! Your administrator user credentials will be sent to you shortly. <br/><br>Please feel free to reach our support team using <a href="mailto:' +
              vrSupportMail +
              '?subject=Customer%20Support&amp;body=This is my body text">vrsupport@valurite.in</a>, in case of any issues.<br/><br><p>Thanking you.</br> <br>ValuRite Team</p></br>    *** This is an automatically generated email, please do not reply ***';
            console.log("Mail sending....");
            var mail = "malathikrishnan@analyticbrains.com";
            //logger.log('info', `${JSON.stringify(docs)}`);
            // strEmail='deepa.mahendran@analyticbrains.com'
            mailService(
              branchMail,
              "Company Registered Successfully !!",
              content,
              SecondarystrEmail
            );
            res.send("1");
            logger.log("info", `Registration Successfully...`);
          } catch (e) {
            console.log(e);
          }
        }
      }
    );
  } catch (ex) {
    logger.log("error", `${ex}`); //logging error into DB
    console.log(ex);
  }
});
function camelize(strVal) {
let str=strVal.toString();   //Issue fix given by Saranya
  if (typeof str === 'string' && str.trim() !== ''&& str !== undefined) {
    return str.replace(/\b\w/g, match => match.toUpperCase());
  } else {
    return str; // Return the original string if it's not a valid string or an empty string
  }
}

module.exports = app1router;
