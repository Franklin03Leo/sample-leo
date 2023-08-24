
var nodemailer = require('nodemailer');
var mailService = require('../commonjs/admin-mail');
var express = require('express');
var router = express.Router();
const logger = require('./logger');
//require('dotenv').config({path: "../.env"})
router.post('/',  function (req, res, next) {
	//DB connection and parameters
	try {
		var strBody = req.body;
		var jsonObj = strBody;
		var firstname = jsonObj.firstname
		var lastname = jsonObj.lastname
		var email_id = jsonObj.emailid
		var mobile_number = jsonObj.phonenumber
		var address1 = jsonObj.addressLine1;
		var address2 = jsonObj.addressLine2;
		var Landmark = jsonObj.landMark;
		var companyName = jsonObj.company;
		var country = jsonObj.country;
		var state = jsonObj.state;
		var city = jsonObj.city;
		var area = jsonObj.area;
		var pinCode = jsonObj.pincode;
		var purpose = jsonObj.purpose;
		var db = req.admin_db;
		var UserName = firstname + ' ' + lastname;
		var collection = db.collection('User');
		var  ReferralCode=jsonObj.ReferralCode;
		var vrSupportMail=process.env.VR_SUPPORT_EMAIL; //assign email from env file .F
		console.log("ghfhgfhg"+ReferralCode)
		// DB query for to find weather the requesting user already registerd or not
		collection.find({ 'ContactDetails.EmailID': email_id }, function (err, docs) {
			if (err) {
				logger.log('error',`${error}`)
						res.send("0");
					}
		         else if (docs == "") {
					 //inserting new user
						collection.insert({
							"FirstName": firstname,
							"LastName": lastname,
							"UserName":UserName,
							"UserID": email_id,
							"RegisteredCompanyName": companyName,
							"Purpose":purpose,
							// "UserType": "Appraiser",
							// "UserRole": "Ind app without Lender",
							"ContactDetails" : {
							//	"PhoneNo" : "",
								"MobileNo" : mobile_number,
								"EmailID" : email_id
							},
							"Address" : {
								"AddressLine1" : address1,
								"AddressLine2" : address2,
								"AddArea" : area,
								"City" : city,
								"State" : state,
								"Country" : country,
								"Pincode" : pinCode,
								"Landmark" : Landmark
							},
							"UserStatus" : "Active",
							"CreatedDate": new Date(),
							"LastUpDate": new Date(),
							"ReferralCode":ReferralCode,
							"ApprovalDetails": {
								"Status": "unApproved",
							}
						}, function (err, result) {
							if(err){
								logger.log('error',`${err}`);
							}else{
								res.send("1");
								logger.log('info',`Registration Successfully...`);
								console.log("firstname",firstname);
								var username = firstname +" "+ lastname
								username = camelize(username)
								// var ccmail= "deepa.mahendran@analyticbrains.com"
          content =
            "Dear <b>" +
            username + "</b>,<br>Thank you for your interest in ValuRite !! You have been registered with the"+
			"<br><b>" + email_id + "</b> and our team will be contacting you for further process.<br><br>Please feel free to reach our support team using <a href='mailto:"+ vrSupportMail +"?subject=Customer%20Support&amp;body=This is my body text'>vrsupport@valurite.in</a> in case of any <br>issues. <br><br>"+
			"Thank you. <br>ValuRite Team <br><br>*** This is an automatically generated email, please do not reply ***";
			//change the email support@valurite.in to vrsupport@valurite.in and get from vrSupportMail .F
			console.log("Mail sending....");
          copyTo = '';
          mailService(email_id, 'Your Login Created Successfully !!', content, copyTo);
							}
						});

			}
			else {
				logger.log('info',`Email Already Exists`)
				res.send("2");
			}
			function camelize(str) {
				return str.split(' ')
				.map(a => a.trim())
				.map(a => a[0].toUpperCase() + a.substring(1))
				.join(" ")
				}
		})
	}
	catch (ex) { 
		logger.log('error',`${ex}`)
	}

});
module.exports = router;
