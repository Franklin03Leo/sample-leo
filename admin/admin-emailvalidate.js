var nodemailer = require('nodemailer');
var mailService = require('../commonjs/admin-mail');
var express = require('express');
var router = express.Router();
const logger = require('./logger');
require('dotenv').config()
router.post('/',  function (req, res, next) {

	//DB connection and parameters
    try{
    var db = req.admin_db;
		var collection = db.collection('User');
        var strObj= req.body;
        var email  =strObj.emailid;
        var newPasswd =strObj.newPasswd;
        var retypeNewPasswd  =strObj.retypeNewPasswd;
        var vrSupportMail= process.env.VR_SUPPORT_EMAIL;//assign email from env file .F
     // checking weather the email id exist or not
     //
        collection.find({ 'ContactDetails.EmailID': email }, function (err, docs) {
			if (err) {
						res.send("0");
                        logger.log("error",`${err}`);
						return;
					}
                    else{
                        if(docs == ""){
                            res.send("1");
                        }
                        else if(docs != ""){
                          console.log("hfhf"+docs[0].UserType)
                            // Checking the user is Active or Not
                             for(var i=0; i<docs.length; i++){
                                if(docs[i].ApprovalDetails.Status == "unApproved") {
                                    res.send("2");
                                }
                                else if(docs[i].ApprovalDetails.Status == "Rejected"){
                              res.send("4");
                                }
                                else if(docs[i].UserType=="Lender" ||docs[i].UserType=="Borrower" )
                                {
                                  console.log(""+docs[i].UserType)
                                  res.send("5");
                                }
                                else{
                                    var decryptCode = RandomString(25)
                                    collection.update({ "ContactDetails.EmailID": email }, {
                                      $set: {
                                        RandomString: decryptCode
                                      }
                                    }), function (err, result) {
                                      if (err) {
                                      }
                                      else {
                                      }
                                    }
                                    
                                    url = process.env.FORGOT_EMAIL_URL +'='+decryptCode
                                    //change the email support@valurite.in to vrsupport@valurite.in and get from vrSupportMail .F
                                    content = 'Dear '+camelize(docs[i].FirstName) +',<br/><br/> Kindly <a href="'+ url+'">Click here</a> to set a new password.<br/><br/>Please feel free to reach our support team using <a href="mailto:'+ vrSupportMail +'?subject=Customer%20Support&amp;body=This is my body text">vrsupport@valurite.in</a>, in case of any issues. <br/><br/> Thanking you. <br/>ValuRite Team <br/><br />*** This is an automatically generated email, please do not reply ***'
                                     //Sending mail
                                    try {
                                     mailService(email,'Password Reset Request',content,'');
                                     res.send("3");
                                     return;
                                    } catch (error) {
                                        res.send(error);
                                    }
                                }
                            }
                        }
                    }
		})
    }catch(err){
        logger.log("error",`${err}`);
    }
});

function camelize(str) {
  console.log('validation str -', str);
  if(str != null && str != undefined && str !=''){ //check condition str should not be null, undefind... F 
    return str.split(' ')
    .map(a => a.trim())
    .map(a => a[0].toUpperCase() + a.substring(1))
    .join(" ")
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

module.exports = router;
