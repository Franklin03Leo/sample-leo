/* To Fetch the userlog details (login, logout time) based on that access count is determined
 with respective to the given companyname,startdate and enddate
 */
const express = require('express');
const getYearmonthWiseStatsforCompanies = express.Router();
var logger= require('./logger');  // adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
getYearmonthWiseStatsforCompanies.post('/',verifyToken,function (req, res, next) {
      //DB Connection 
      try{
    const db = req.admin_db;
    const coll = db.collection('user');
    if (!db || !db.collection) {
        console.log("db object was not found");
        res.json({});
        return;
    }
    const companies = req.body.companyName;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const searchtype = req.body.type;

    const ms = {
        day: 24 * 60 * 60 * 1000
    };
    // Method for Date conversion
    const dateAfter = (date) => new Date(new Date(date).valueOf() + (ms.day));
    // Query to get userlogs 
    coll.aggregate([
        {
            $match: {
                company_institute:
                    {
                        $in: companies
                    }
            }
        },
        {
            $lookup:
                {
                    from: "userlogs",
                    localField: "contact_details.email_id",
                    foreignField: "email_id",
                    as: "docs"
                }
        },
        { $unwind: "$docs" },
        {
            $match: {
                $and: [
                    { "docs.login_time": { "$lt": dateAfter(endDate) } },
                    { "docs.login_time": { "$gte": dateAfter(startDate) } }
                ]
            }
        },
        {
            $project: {
                _id: 0,
                company_institute: 1,
                year: { $year: "$docs.login_time" },
                month: { $month: "$docs.login_time" },
            }
        },
        {
            $group: {
                "_id": {
                    company_name: "$company_institute",
                    year: "$year",
                    month: "$month",
                },
                "count": { "$sum": 1 }
            }
        },
        {
            $project: {
                _id: 0,
                companyname: "$_id.company_name",
                year: "$_id.year",
                month: "$_id.month",
                count: "$count"
            }
        }
    ]).then((docs) => {
        res.json(docs);
        var logobj={};
        logobj.UserID= "UserID"
        logobj.Data = docs;
        logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
    
       // logger.log('info',`${JSON.stringify(docs)}`);  //logging data into DB
    }).catch((err) => {
        logger.log('error',`${err}`);  //logging error into DB
        console.log("Error in Yearly statistics for companies for given Date Range from DB " + err);
    })
}
catch(ex){
    logger.log('error',`${ex}`); //logging error into DB
}
});

module.exports = getYearmonthWiseStatsforCompanies;
