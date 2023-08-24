/**
 * Enquiry Form
 * this feature is used by users to enquiry their queries by sending email 
 by filling some required fields with validations in it. 
 */
//var http = require("http");
var mail = require("../commonjs/admin-mail");
var express = require('express');
var router = express.Router();
//DB connection and parameters used
router.post('/', function (req, res) {

    var db = req.admin_db;
    var paramcollection = db.collection('Param');
    var collection = db.collection('Enquiry');
    var jsonObj = req.body;
    var name = jsonObj.userName;
    var emailid = jsonObj.emailId;
    var subject = jsonObj.subject;
    var message = jsonObj.message;

    let email_Flag;
    let to_email;
    // console.log(jsonObj)
    //DB Query Here
    collection.insert({
        "User_Name": name,
        "EmailID": emailid,
        "Subject": subject,
        "Query": message,
        "UpdatedDate": new Date()
    })
    // , function (err, result) {
    //     if (err) {
    //     }
    //     else {
    //        console.log("saf") 
   
    //     }
    // } 
    
            //condition for sending email
            // if (email_Flag == true) {

                paramcollection.find({ "ParamName": { $in: ["UserName", "Password", "Service", "SecureConnection", "HostName", "Port"] } },
                 { "_id": 0, "ParamValue": 1, "ParamName": 1 }).then((docs) => {
                    for(let i=0; i< docs.length; i++) {
                        if(docs[i].ParamName == 'UserName' ) {
                         var auth_user = docs[i].ParamValue;
                        } else if (docs[i].ParamName == 'Password') {
                         var auth_password = docs[i].ParamValue;
                        } else if (docs[i].ParamName == 'Service') {
                         var mailService = docs[i].ParamValue;
                        } else if (docs[i].ParamName == 'SecureConnection') {
                         var secureConn = docs[i].ParamValue;
                        } else if (docs[i].ParamName == 'HostName') {
                         var hostName = docs[i].ParamValue;
                        } else if (docs[i].ParamName == 'Port') {
                          var port = docs[i].ParamValue;
                        }         
                    } 
                const template = 'Dear Sir/Madam,<br/><br/>Following user has sent an Enquiry:<br/><br/><b>User: </b> ' + name + '</b><br/><b>Email ID : </b>' + emailid + '</b><br/><b>Subject: </b> ' + Subject + '</b><br/><b>Message : </b>' + message + '</b><br/><br/>Best regards,<br />' + name + '<br />'
                const fromemail = auth_user;
                const toEmail = auth_user;
                const subject = 'Enquiry from User';
                const copyMail = emailid;
                const newTransportPromise = mail(toEmail, fromemail, subject, template, auth_user, auth_password, mailService, secureConn, hostName, port, copyMail);
                newTransportPromise.then(docs => {
                    res.send("1");
                    res.end();
                }).catch((err) => {
                    res.send("0");
                    res.end();
                });
                 })
        // }
            // else {
            //     res.send("2");
            // }
        // }).catch((err) => {
        //     res.send("0");
        //     res.end();
        // })

})
module.exports = router;















