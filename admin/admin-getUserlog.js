/* Fetch the Userlog for selected username or company & username from 'userlogs' collection */
var express = require('express');
var userlogrouter = express.Router();
var http = require("http");
const logger = require('./logger'); //Adding logggers
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
    userlogrouter.get('/',verifyToken ,function (req, res, next) {
     try{
        //DB Connection and its parameters
        var strBody = req.body;
        var email_id = req.query.username;
        var db = req.admin_db;
        var collection = db.collection('User');
        if (!db || !db.collection) {
            console.log("collection not found");
            res.json({});
            return;
        }
        // Method to convert duration in HH:MM:SS format
        function msToTime(duration) {
            var milliseconds = parseInt((duration % 1000) / 100),
                seconds = parseInt((duration / 1000) % 60),
                minutes = parseInt((duration / (1000 * 60)) % 60),
                hours = parseInt((duration / (1000 * 60 * 60)) % 24);

            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            return hours + ":" + minutes + ":" + seconds;
        }
        // Query to get Userlog for based on Username
        collection.aggregate([{ $match: { "ContactDetails.EmailID": email_id } },
        {
            "$lookup": {
                from: "Userlogs",
                localField: "ContactDetails.EmailID",
                foreignField: "email_id",
                as: "docs"
            }
        },
        {
            "$unwind": "$docs"
        },
        {
            "$group": {
                _id: {
                    "CompanyName": "$CompanyName",
                    "EmailId": "$ContactDetails.EmailID",
                    "LoginTime": "$docs.login_time",
                    "LogoutTime": "$docs.logout_time",
                    "userName" : "$UserName"
                }
            }
        },
        {
            "$project":
                {
                    "companyName": "$_id.CompanyName",
                    "EmailId": "$_id.EmailId",
                    "loginTime": "$_id.LoginTime",
                    "logoutTime": "$_id.LogoutTime",
                    "UserName" : "$_id.userName",
                    _id: 0,
                }
        },
        {
            $sort:
                { "loginTime": -1 }
        }]).then((docs) => {
            for (let obj of docs) {
                if (obj.logoutTime === void (0))//void(0) to check null or undefined
                {
                    obj.duration = 'NA';
                    obj.logoutTime = 'NA';
                } else {
                    obj.duration = msToTime(obj.logoutTime - obj.loginTime);
                }
            }
            // logger info starts here - added by SRINIVASAN
            var logobj={};//object initialization
            logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
            logobj.Data = docs;//adding data to object
            logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
            // logger info ends here - added by SRINIVASAN
            res.json(docs);
        }).catch((err) => {
            //logger error - added by SRINIVASAN
            logger.log("error",`${err}`);
            console.log("Error in retriving into DB " + err);
        }).then(() => db.close())
    }
    catch(err){
        //logger error - added by SRINIVASAN
        logger.log("error",`${err}`);
    }
});
module.exports = userlogrouter;
