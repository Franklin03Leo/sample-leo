/* To Fetch the Currently Logged In User Details */
const express = require("express");
const logger = require("./logger");   //adding loggers
const loggedinusers = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
loggedinusers.get("/",verifyToken, function (req, res, next) {
  try {
    //DB Connection
    const db = req.admin_db;
    let date = new Date();
    let tdydate = date.setHours(0, 0, 0, 0);
    const coll = db.collection("Userlogs");
    if (!db || !db.collection) {
      //logger error - added by SRINIVASAN
      logger.log("error", "db object was not found");
      res.json({});
      return;
    }
    // Method to convert duration in HH:MM:SS format
    function msToTime(login) {
      var milliseconds = parseInt((login % 1000) / 100),
        seconds = parseInt((login / 1000) % 60),
        minutes = parseInt((login / (1000 * 60)) % 60),
        hours = parseInt((login / (1000 * 60 * 60)) % 24);
      hours = hours < 10 ? +hours : hours;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      if (hours < 10) {
        hours = "0" + hours;
      }
      return hours + ":" + minutes + ":" + seconds;
    }
    // DB Query
    /* If Logout time is not present in 'userlogs' collection then username(emailid) 
    are fetched with login & logout time, based on the emailid the user details are retrieved from 'user' collection */

    coll
      .aggregate([
        {
          $match: {
            $and: [
              { logout_time: { $exists: false } },
              { login_time: { $gte: new Date(tdydate) } },
            ],
          },
        },
        {
          $lookup: {
            from: "User",
            localField: "email_id",
            foreignField: "ContactDetails.EmailID",
            as: "docs",
          },
        },
        {
          $lookup: {
            from: "Userlogs",
            localField: "email_id",
            foreignField: "email_id",
            as: "docs2",
          },
        },
        { $unwind: "$docs" },
        { $unwind: "$docs2" },
        {
          $group: {
            _id: {
              email: "$email_id",
              login: "$login_time",
              company: "$docs.CompanyName",
              rolename: "$docs.UserType",
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            email: "$_id.email",
            login: "$_id.login",
            company: "$_id.company",
            rolename: "$_id.rolename",
            count: "$count",
          },
        },
      ])
      .then((docs) => {
        res.json(docs);
   
        var logobj = {};//object initialization
        logobj.UserID = "dummyuserName@analyticBrains.com";//adding userid to object
        logobj.Data = docs;//adding data to object
        // logger.log("info", `${JSON.stringify(logobj)}`);//object parse into logger
      
      })
      .catch((err) => {
       
        logger.log("error", `${err}`);   //logger error - added by SRINIVASAN
        //console.log("Error in retriving logged in users list from DB " + err);
      });
  } catch (err) {
    //console.log("try error");
   
    logger.log("error", `${err}`);    //logger error here - added by SRINIVASAN
  }
});

module.exports = loggedinusers;
