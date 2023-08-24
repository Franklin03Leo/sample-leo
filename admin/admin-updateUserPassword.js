/* Update user password in the 'user' collection with respect to the given username(emailid) */
var http = require("http");
var express = require('express');
var router = express.Router();
var mailService = require('../commonjs/admin-mail');
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
var logger= require('./logger');
const bcrypt=require('bcryptjs');
require('dotenv').config()

router.post('/',verifyToken, function (req, res, next) {

    try {
  console.log(req.body)
    const db = req.admin_db;
    var collection = db.collection('User');
    
        // Query to update password, based on the given username(emailid)
        collection.update({ "ContactDetails.EmailID":  req.body.username },
            {
                $set: {
                    "PasswordDetails.Password":bcrypt.hashSync(req.body.password,10),
                    // "password_details.update_password": update_password,
                    "password_details.last_updated_date": new Date()
                }
            },
            function (err, result) {
                if (err) {
                  console.log(err)
                  logger.log('error',`${err}`)
                } else {
                    res.send("1")

                    content = 'Dear Sir/Mam,<br/><br/>Your Password has been changed by Admin. <br/><br/> Your New Password is <b>'+ req.body.password  +'</b><br/><br/>Please <a href="'+ process.env.LOGIN_URL +'"> Click here</a> to Login... Thank You!!!<br/><br/>Best Regards,<br/>Admin';
                     mailService(req.body.username,'Password Updated',content);
                 logger.log("info",`Password changed successfully...`);

                  
                }
            });
    }
    catch (ex) {
        logger.log('error',`${ex}`);
    }
});
module.exports = router;
