/**
 * Forget Password
 * this feature is used when users forgets their password by sending email 
 by filling some required fields with validations in it. 
 */
var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
const bcrypt=require('bcryptjs');
const mailService = require('../commonjs/admin-mail');
const logger = require('./logger');
router.post('/', function (req, res, next) {
    function randomPassword() {
        chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        pass = "";
        for (x = 0; x < 8; x++) {
            i = Math.floor(Math.random() * 62);
            pass += chars.charAt(i);
        }
        return pass;
    }
    
    //DB connection and parameters used
    try {
        var strBody = req.body;
        var jsonObj = strBody;
        var EmailID = jsonObj.emailid;
        var randomPassword = jsonObj.newPasswd; //Generate the random password for update password
        var encrypt_password = bcrypt.hashSync(randomPassword,10);
        var flag = jsonObj.flag
        var db = req.admin_db;
        var URL
        var collection = db.collection('User');

        //*******************************Retrieves set of docs matching the find Criteria**********************************//
        collection.find({
            'ContactDetails.EmailID': EmailID
        },{FirstName:1,PasswordDetails:1,LastName:1}, function (err, docs) {
            //Check for Empty docs     
            if (docs == "") {
                res.send("Not Exist");
                
            } else {
                docs.forEach(function (doc) {
                    // condition used when password is not null PasswordDetails 
                    if (doc.PasswordDetails.Password != "") {
                        try {
                            collection.update({
                                "ContactDetails.EmailID": EmailID
                            }, {
                                    $set: {
                                        "PasswordDetails.Password": encrypt_password,
                                        "PasswordDetails.update_password": "false",
                                        "PasswordDetails.last_updated_date": new Date()
                                    }
                                },
                                function (err, result) {
                                    if (err) {
                                        res.send(err);
                                        logger.log("error",`${err}`);
                                    } else {
                                        try {
                                        //Getting updated password details
                                        collection.find({'ContactDetails.EmailID': EmailID},
                                        { FirstName:1,UserID:1}).then((docs) =>{
                                            if(flag != 1){


                                                // if(docs[0].ReferralCode==null||docs[0].ReferralCode=="")
                                                // URL=process.env.LOGIN_URL
                                                // else
                                                //              URL=process.env.LOGIN_URL+'r/'+ReferralCode
                                                //             console.log("URL"+URL)


                                            content = 'Dear '+ docs[0].FirstName +',<br/><br/>Your Password has been updated Successfully. <br/><br/> Your New Password is <b>'+ randomPassword +'</b><br/><br/>Please <a href="'+ process.env.LOGIN_URL +'"> Click here</a> to Login... Thank You!!!<br/><br/>Best Regards,<br/>Admin <br/><br/>*** This is an automatically generated email, please do not reply ***';
                                            mailService(EmailID,'Password Updated',content);       
                                           
                                        }
                                            // else{
                                            // content = 'Dear '+ docs[0].FirstName +',<br/><br/>Your Account has been Activated Successfully. <br/><br/> Your New Password is <b>'+ randomPassword +'</b><br/><br/>Please <a href="'+ process.env.LOGIN_URL +'"> Click here</a> to Login... Thank You!!!<br/><br/>Best Regards,<br/>Admin';
                                            // mailService(EmailID,'Account Activated',content);

                                            // }
                                            // Sending conformation mail
                                     
                                        res.send('1');
                                        logger.log("info",`Password changed successfully...`);

                                     
                                        })
                                    } catch (error) {
                                        res.send(error);
                                        logger.log('error',`${error}`);
                                        
                                    }
                                        
                                    }
                                });
                        } catch (ex) {
                        }
                    } else {
                        res.send('Invalid');
                    }
                });
            }
        });
    } catch (ex) {
        logger.log("error",`${ex}`);
    }
});
module.exports = router;
