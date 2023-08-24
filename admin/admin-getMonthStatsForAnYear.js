/* Fetch the userlogs for the users for the current year */
const express = require('express');
const getMonthStatsForAnYear = express.Router();
var logger= require('./logger');        //adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
getMonthStatsForAnYear.post('/',verifyToken, function (req, res, next) {
    //DB connection
    try{   
    const db = req.db;
    const coll = db.collection('Appraisal');
    if (!db || !db.collection) {
        console.log("db object was not found");
        res.json({});
        return;
    }
        //const year = parseInt(req.query.year, 10);
        const year = parseInt(req.body.year, 10);        
    const currentYearString = year.toString();
    const nextYearString = (year + 1).toString();
    const dashboard = req.body.dashboard;
    const companyname = req.body.companyname;
    //console.log("getmonthstats "+nextYearString + " "+currentYearString)
    // DB Query here
        /* The data will be fetched from 'userlogs' collection for current year */
        var matchquery = {};
        //Malathi-07-02-2023-Start
        var projectquery={};
        var groupquery={};
        var Sec_Project={};
        //Malathi-07-02-2023-End

        if (dashboard == 'adminadmin') { 
            matchquery = {
                $match: {
                    $and: [
                        { "ModifiedDate": { "$lt": new Date(nextYearString) } },
                        { "ModifiedDate": { "$gte": new Date(currentYearString) } }
                    ]
                }
            }
            //Malathi-07-02-2023-Start
            projectquery= {
                $project: {
                    _id: 0,
                    month: { $month: "$ModifiedDate" },
                    year: { $year: "$ModifiedDate" },
                    ValuationID: "$ValuationID",
                    // CompanyName: "$CompanyName"
                }
            }
            groupquery={
                $group: {
                    "_id": {
                        month: "$month",
                        year: "$year",
                        // CompanyName: "$CompanyName"
                    },
                    // "count": { "$sum": 1 }
                   //"count" : {$addToSet : "$ValuationID"}
                   "count" : {$push : "$ValuationID"}
                }
            }
            Sec_Project= {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                   count: {$size : "$count"},
                    // companyname: "$CompanyName",
                    _id: 0
                }
            }
            //Malathi-07-02-2023-End
        }
        else if (dashboard == 'appraiseradmin') {
            matchquery = {
                $match: {
                    CompanyName :companyname,
                    $and: [
                        { "ModifiedDate": { "$lt": new Date(nextYearString) } },
                        { "ModifiedDate": { "$gte": new Date(currentYearString) } }
                    ]
                }
            }
            //Malathi-07-02-2023-Start
            projectquery= {
                $project: {
                    _id: 0,
                    month: { $month: "$ModifiedDate" },
                    year: { $year: "$ModifiedDate" },
                    ValuationID: "$ValuationID",
                    CompanyName: "$CompanyName"
                }
            }
            groupquery={
                $group: {
                    "_id": {
                        month: "$month",
                        year: "$year",
                        CompanyName: "$CompanyName"
                    },
                    // "count": { "$sum": 1 }
                   //"count" : {$addToSet : "$ValuationID"}
                   "count" : {$push : "$ValuationID"}
                }
            }
            Sec_Project= {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                   count: {$size : "$count"},
                    companyname: "$CompanyName",
                    _id: 0
                }
            }
        }
        
        coll.aggregate([
            matchquery,
        // {
        //     $match: {
        //         $and: [
        //             { "ModifiedDate": { "$lt": new Date(nextYearString) } },
        //             { "ModifiedDate": { "$gte": new Date(currentYearString) } }
        //         ]
        //     }
        // },
        projectquery,
        groupquery,
        { $sort: { "_id.month": 1 } },
       Sec_Project
       //Malathi-07-02-2023-End
    ]).then((docs) => {
       // console.log("GetMonthstat"+JSON.stringify(docs))
        res.json(docs);
       // logger.log('info',`${JSON.stringify(docs)}`);
        var logobj={};
        logobj.UserID= "UserID"
        logobj.Data = docs;
      //  logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
    
      //  console.log(docs)
    }).catch((err) => {
        logger.log('error',`${err}`);  //logging error into DB
        console.log("Error in retriving monthly statistics for an year from DB " + err);
    })
}
catch(ex){
    console.log(ex) 
 logger.log('error',`${ex}`);  //logging error into DB
}
});

module.exports = getMonthStatsForAnYear;
