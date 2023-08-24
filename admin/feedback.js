/**
 * Feedback
 * this feature is used by users to send feedback by sending email 
 by filling some required fields with validations in it. 
 */
//var http = require("http");
var mail = require("../commonjs/admin-mail");
var express = require('express');
var router = express.Router();
//DB connection and parameters used
router.post('/', function (req, res) {
    var jsonObj = req.body;
    console.log(jsonObj)
    var username = jsonObj.username;
    var emailid = jsonObj.emailid;
    var Organization = jsonObj.Organization;
    var email_flag = jsonObj.emailFlag;
    var toEmail = jsonObj.toEmailID;
    var feedback = jsonObj.feedback ? jsonObj.feedback : '';

    const db = req.admin_db;
    var collection = db.collection('Feedback');
    var paramcollection = db.collection('Param');
    //DB Query
    collection.insert({
        "Name": username,
        "EmailID": emailid,
        "CompanyName": Organization,
        "FeedBack": feedback,
        "UpdatedDate": new Date()
    }), function (err, result) {
        if (err) {
        }
        else {
        }
    }
    //condition for sending email
    if (email_flag == true) {
        paramcollection.find({ "param_name": { $in: ["User_Name", "Password", "Service", "Secure_Connection", "Host_Name", "Port"] } }, { "_id": 0, "param_value": 1, "param_name": 1 }).then((docs) => {
            let auth_user = docs[0].param_value;
            let auth_password = docs[1].param_value;
            let mailService = docs[2].param_value;
            let secureConn = docs[3].param_value;
            let hostName = docs[4].param_value;
            let port = docs[5].param_value;
            const template = '<p>Dear Support Team, </p><b>User name : </b> ' + emailid + '</b></p><br/> <b>Organization : </b> ' + Organization + '</b></p><br/> <b>Feedback Type : </b> ' + feedbacktype + '</b></p><br/><b>Feedback : </b>' + feedback + '<br/><p>Regards,<br>' + username + '</p><br /><br/>   *** This is an automatically generated email, please do not reply ***'
            const fromemail = toEmail;
            const email_id = toEmail;
            const subject = 'Feedback';
            const text = ' Welcome!' + username;
            const copyMail = emailid
            const newTransportPromise = mail(fromemail, email_id, subject, template, auth_user, auth_password, mailService, secureConn, hostName, port, copyMail);
            newTransportPromise.then(docs => {
                res.send("1");
            }).catch((err) => {
                res.send("3");
            });
        }).catch((err) => {
        })
    } else {
        res.send("2");
    }
})
module.exports = router;

