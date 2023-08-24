//var http = require("http");
var nodemailer = require('nodemailer');
var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {
	//Method to encrypt the password
	function encrypt(pass) {
		var cryptLib = require('cryptlib'),
			iv = 'rv6Isv_BpSFBrB2V'                              //cryptLib.generateRandomIV(16), //16 bytes = 128 bit 
		key = 'b16920894899c7780b5fc7161560a412'             //cryptLib.getHashSha256('my secret key', 32), //32 bytes = 256 bits 
		encryptedText = cryptLib.encrypt(pass, key, iv);
		return encryptedText;
	}
	//DB connection and parameters
	try {
		var strBody = req.body;
		var jsonObj = strBody;
		var firstname = jsonObj.firstname
		var lastname = jsonObj.lastname
		var email_id = jsonObj.emailid
		var ph_number = jsonObj.phonenumber
		var department = jsonObj.department
		var company_institute = jsonObj.company
		var country = jsonObj.country
		var area_of_interest = jsonObj.areaofinterest;
		var ip_address = jsonObj.ipaddress;
		var request = jsonObj.request;
		var update_password = jsonObj.updatepassword;
		var randomPassword = jsonObj.password;//Generate the random password for new user
		var encryp_password = encrypt(randomPassword);
		var navigateurl = jsonObj.url;
		var db = req.admin_db;
		var collection = db.collection('user');
		//Query to insert new user in DB
		collection.find({ 'contact_details.email_id': email_id }, function (err, docs) {
			if (docs == "") {
				var db2 = req.db;
				var coll = db2.collection('user');
				coll.find({}, function (err, cc) {
					if (err) {
						res.send("0");
					}
					else {
						collection.insert({
							"first_name": firstname,
							"last_name": lastname,

							"password_details": {
								"password": encryp_password,
								"update_password": update_password,
								"last_updated_date": new Date()
							},
							"contact_details": {
								"phone_number": ph_number,
								"email_id": email_id
							},
							"department": department,
							"company_institute": "",
							"registered_company": company_institute,
							"country": country,
							"area_of_interest": area_of_interest,
							"request_type": request,

							"ip_address": ip_address,
							"created_date": new Date(),
							"last_updated_date": new Date(),
							"user_status": "InActive",
							"approval_details": {
								"status": "unApproved",
							},
							"rolename": "Free User"
						}, function (err, result) {
							if (err) {
							} else {
								res.send("1");
								res.end();
							}
						});
					}
				})
			}
			else {
				res.send("2");
			}
		})
	}
	catch (ex) {
	}
});
module.exports = router;