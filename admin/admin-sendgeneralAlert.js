var express = require("express");
const logger = require("./logger"); //Adding loggers
var router = express.Router();
var verifyToken = require("../commonjs/Verify_JWT"); //  To Verify Token
var mailService = require("../commonjs/admin-mail");
var fs = require("fs")
require('dotenv').config({path: "../.env"})

router.post("/", verifyToken, function (req, res, next) {
  try {
    var strBody = req.body;
    var jsonObj = strBody;
    var compnayname = [];
    var compnayname = [];
    compnayname = jsonObj.companyNames;
    contractreference = jsonObj.contractReference;
    var mail_Title = jsonObj.mail_Title;
    var mail_Content = jsonObj.mail_Content;
    var contact_Type = jsonObj.contact_Type;
    var dynamicFile = jsonObj.dynamicFile
    var PrimaryContact = []
    var SecondaryContact = []
    var PrimarySecondary = []
    //DB Connection
    const db = req.admin_db;
    const Companycoll = db.collection("Company"); // added by Naveen
    const Usercoll = db.collection("User");
    mail_Content = mail_Content + '<br><p style="font-family: inherit">Thanking you<br>ValuRite admin</p>'
   

    var attachments = []
    if(dynamicFile.length >= 1){
    for (let i = 0; i < dynamicFile.length; i++) {
      const obj = {}
      // obj['filename'] = dynamicFile[i].fileName; // with saving
      // obj['path'] = '../../../../../PDF Saving/'+ dynamicFile[i].fileName;
      // obj['contentType'] = 'application/pdf';

      obj['filename'] = dynamicFile[i].fileName; // without saving
      obj['content'] = dynamicFile[i].base64;
      obj['encoding'] = 'base64';

      attachments.push(obj)
    }
  }

  // ********************get company contact email id**********************
    var ContactQuery = [
      {
        $match: {
          CompanyName: { $in: compnayname },
        },
      },
      {
      $project: {
        Contact_details: "$Contact_details",
        _id: 0,
      },
    },
    ]

 // ********************get Contract email id**********************

    var contractEmail = [
      {
        $match: {
          "Contract.ContractReference": { $in: contractreference },
        },
      },
      {
        $project: {
          Contact_details: "$ContactDetails.EmailID",
          _id: 0,
        },
      },
    ];

    var contactEmail = []
    Companycoll.aggregate(ContactQuery, function (err, companydata) {
      if (err) {
        console.log(err);
      }else{
        let contactDetails = []
      for (let i = 0; i < companydata.length; i++) {
        for (let j = 0; j < companydata[i]['Contact_details'].length; j++) {
          contactDetails.push(companydata[i]['Contact_details'][j])
        }
      }
        // *************** check contact type ****************
        for(let i=0;i<contactDetails.length;i++){
          if(contactDetails[i].type == "Primary"){ // contact type Primary
          PrimaryContact.push(contactDetails[i].email_id)
          }
          if(contactDetails[i].type == "Secondary"){ // contact type Secondary
            SecondaryContact.push(contactDetails[i].email_id)
          }
          PrimarySecondary.push(contactDetails[i].email_id) // contact type Primary & Secondary
        }

        if(contact_Type.Primary == true && contact_Type.Secondary == false){
          contactEmail = PrimaryContact
        }
        else if(contact_Type.Primary == false && contact_Type.Secondary == true){
          contactEmail = SecondaryContact
        }
        else{
          contactEmail = PrimarySecondary
        }

        // console.log("contactEmail",contactEmail);
        // console.log("PrimaryContact",PrimaryContact);
        // console.log("SecondaryContact",SecondaryContact);
        // console.log("PrimarySecondary",PrimarySecondary);

      // *******************getting contract reference user's email id***************************************** 

        if(contractreference.length >= 1){
        Usercoll.aggregate(contractEmail, function (err, userdata) {
          if(err){
            console.log(err);
          }
          else{
            if(userdata.length >= 1){
              userdata.map((val)=>{
                contactEmail.push(val.Contact_details)
              })
            }
              // console.log("with",contactEmail);
              // *******************Sending Mail ***************************************** 
              mailService(contactEmail, mail_Title,mail_Content,"",attachments = attachments);
              res.send('1')
          }
          
        })
      }else{

      // console.log("withouy",contactEmail);

      // *******************Sending Mail ***************************************** 
      mailService(contactEmail, mail_Title,mail_Content,"",attachments = attachments);
      res.send('1')
      }
    }

    })
    
  } catch (err) {
    logger.log("error", `${err}`);
  }
});
module.exports = router;
