/**
 * Admin dashboard popup is used to view the popup table when,
 *  general statistics and usage statistics charts are clicked
 */
var express = require('express');
var router = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
var logger= require('./logger');   // adding logger
router.post('/',verifyToken, function (req, res) {
   try{
       
    //DB Connection
    var db = req.db;
    var collection = '';

        var strBody = req.body;
        var jsonObj = strBody;
        //method used for dateformat
        var ms = {
            day: 24 * 60 * 60 * 1000
        };
        var dateAfter = (date) => new Date(new Date(date).valueOf() + (ms.day));
        var query = [];
        //condition used when usage statistics chart is clicked 
        if (jsonObj.charttype == "barchart") {
            //DB Connection and Query 
            collection = db.collection('Appraisal');
            const year = parseInt(jsonObj.year, 10);
            const month = new Date(jsonObj.month + '-1-01').getMonth() + 1; //parseInt(jsonObj.month, 10);
            matchquery = { $match: { "_id.year": year } };
            query = [{
                $group: {
                    _id: {
                        month: { $month: "$ModifiedDate" },
                        year: { $year: "$ModifiedDate" },
                        // email_id: "$ValuationID"
                        userID: "$AppraiserID",
                        companyname:"$CompanyName",
                    }, myCount: { $sum: 1 }
                }
            },
            { $match: { "_id.month": month, "_id.year": year }},
                matchquery,
            // {
            //     $lookup: {
            //         from: "User",
            //         localField: "_id.userID",
            //         foreignField: "UserID",
            //         as: "user"
            //     }
            // },
            // { $unwind: { path: "$user" } },
            {
                $project: {
                    _id: 0,
                    "User ID" : "$_id.userID",
                    "Valuation Count": "$myCount",
                    "Company Name": {"$ifNull" : ["$_id.companyname", ""] }
                    // role_name: "$user.rolename"
                }
            }];
        }
      //condition used when general statistics chart is clicked
        else if (jsonObj.charttype == "stackbar") {
            //DB connection
            collection = db.collection('Appraisal');
            const month = jsonObj.month + 1;
            const year = parseInt(jsonObj.year, 10);
            let ArrayMatchQuery = [];  
            
            if ("email_id" in jsonObj) {
                ArrayMatchQuery.push({
                    'AppraiserID': jsonObj.email_id 
                        });
             } 
            if ("company_name" in jsonObj) {
                ArrayMatchQuery.push({
                    'CompanyName': jsonObj.company_name 
                 });
            }  
            if ("company_name" in jsonObj == false) {
                if ("companyname" in jsonObj) {
                    ArrayMatchQuery.push({
                        'CompanyName': {'$in' : [jsonObj.companyname] }
                     });
                 }                
            }  
            if ("valuationstatus" in jsonObj) {
                ArrayMatchQuery.push({
                    'AppraisalStatus': jsonObj.valuationstatus
                });
             } 
            let MatchQuery = {}

            MatchQuery = {
                '$and': ArrayMatchQuery
                }            

       //Method used when user selects startdate in general statistics chart
            if ("startdate" in jsonObj) {
                var startdate = new Date(jsonObj.startdate);
                var enddate = new Date(jsonObj.enddate);
                var matchmonth1 = startdate.getMonth();
                var matchmonth2 = enddate.getMonth();
                var firstday = new Date(year, month - 1, 1);
                var lastday = new Date(year, month, 0);
              //Method used to get the inbetween months from startdate to enddate
                if (matchmonth1 + 1 == month) {
                    console.log("Match1")
                    // firstmatch = {};
                    // if ("email_id" in jsonObj) {
                    //     // firstmatch = { $match: { "contact_details.email_id": jsonObj.email_id } };
                    //     firstmatch = { $match: { "AppraiserID": jsonObj.email_id } };
                    // } else {
                    //     firstmatch = { $match: { "CompanyName": jsonObj.company_name } };
                    // }
                    //DB Query Here
                    query = [
                       // firstmatch,
                       {
                        $match: MatchQuery
                         },
                        // {
                        //     $lookup: {
                        //         from: "userlogs",
                        //         localField: "contact_details.email_id",
                        //         foreignField: "email_id",
                        //         as: "userlogs"
                        //     }
                        // },
                        // { $unwind: { path: "$userlogs" } },
                        {
                            $match: {
                                $and: [
                                    { "ModifiedDate": { "$gte": dateAfter(startdate) } },
                                    { "ModifiedDate": { "$lte": dateAfter(enddate) } }

                                ]
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    month: { $month: "$ModifiedDate" },
                                    year: { $year: "$ModifiedDate" },
                                    email_id: "$AppraiserID",
                                    company_name: "$CompanyName",
                                    // role_name: "$rolename"
                                }, myCount: { $sum: 1 }
                            }
                        },
                        { $match: { "_id.month": month } },
                        { $match: { "_id.year": year } },
                        {
                            $project: {
                                _id: 0,
                                "User ID": "$_id.email_id",
                                "Valuation Count": "$myCount",
                                "Company Name": {"$ifNull" : ["$_id.company_name", ""] }
                                // role_name: "$_id.role_name"
                            }
                        }];
                }
                else if (matchmonth2 + 1 == month) {
                    console.log("Match2")
                    YearMonthmatch = {};
                    if (jsonObj.searchtype == "monthwise") {
                        YearMonthmatch = { $match: { "_id.year": year,"_id.month": month } }
                    } else { 
                        YearMonthmatch ={ $match: { "_id.year": year } }
                    }
                    // firstmatch = {};
                    // if ("email_id" in jsonObj) {
                    //     firstmatch = { $match: { "AppraiserID": jsonObj.email_id } };
                    // } else {
                    //     firstmatch = { $match: { "CompanyName": jsonObj.company_name } };
                    // }
                    query = [
                       // firstmatch,
                       {
                        $match: MatchQuery
                       },
                        // {
                        //     $lookup: {
                        //         from: "userlogs",
                        //         localField: "contact_details.email_id",
                        //         foreignField: "email_id",
                        //         as: "userlogs"
                        //     }
                        // },
                        // { $unwind: { path: "$userlogs" } },

                        {
                            $match: {
                                $and: [
                                    { "ModifiedDate": { "$gte": dateAfter(startdate) } },
                                    { "ModifiedDate": { "$lte": dateAfter(enddate) } }

                                ]
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    month: { $month: "$ModifiedDate" },
                                    year: { $year: "$ModifiedDate" },
                                    email_id: "$AppraiserID",
                                    company_name: "$CompanyName",
                                    // role_name: "$rolename"
                                }, myCount: { $sum: 1 }
                            }
                        },
                        //{ $match: { "_id.month": month } },                       
                       // { $match: { "_id.year": year,"_id.month": month } },
                       YearMonthmatch,
                        {
                            $project: {
                                _id: 0,
                                "User ID": "$_id.email_id",
                                "Valuation Count": "$myCount",
                                "Company Name": {"$ifNull" : ["$_id.company_name", ""] },
                                // role_name: "$_id.role_name"
                            }
                        }];
                } else {
                    console.log("Match3")
                    matchquery = {};
                    group = {};
                    // firstmatch = {};
                    // if ("email_id" in jsonObj) {
                    //     firstmatch = { $match: { "AppraiserID": jsonObj.email_id } };
                    // } else {
                    //     firstmatch = { $match: { "CompanyName": jsonObj.company_name } };
                    // }
               //Method used when users selects monthwise option
                    if (jsonObj.searchtype == "monthwise") {
                        matchquery = { $match: { "_id.month": month } },
                            group = {
                                $group: {
                                    _id: {
                                        month: { $month: "$ModifiedDate" },
                                        year: { $year: "$ModifiedDate" },
                                        email_id: "$AppraiserID",
                                        company_name: "$CompanyName",
                                        // role_name: "$rolename"
                                    }, myCount: { $sum: 1 }
                                }
                            };
                        query = [
                            //firstmatch,
                            {
                                $match: MatchQuery
                            },
                            // {
                            //     $lookup: {
                            //         from: "userlogs",
                            //         localField: "contact_details.email_id",
                            //         foreignField: "email_id",
                            //         as: "userlogs"
                            //     }
                            // },
                            // { $unwind: { path: "$userlogs" } },
                            group,
                            matchquery,
                            {
                                $project: {
                                    _id: 0,
                                    "User ID": "$_id.email_id",
                                    "Valuation Count": "$myCount",
                                    "Company Name":  {"$ifNull" : ["$_id.company_name", ""] },
                                    // role_name: "$_id.role_name",
                                }
                            }];

                    } 
                    //Method used when user selects yearwise option
                    else if (jsonObj.searchtype == "yearwise") {
                        console.log("Match4")
                        if ("startdate" in jsonObj) {
                            //DB Query Here
                            query = [
                               // firstmatch,
                               {
                                $match: MatchQuery
                            },
                                // {
                                //     $lookup: {
                                //         from: "userlogs",
                                //         localField: "contact_details.email_id",
                                //         foreignField: "email_id",
                                //         as: "userlogs"
                                //     }
                                // },
                                // { $unwind: { path: "$userlogs" } },
                                {
                                    $match: {
                                        $and: [
                                            { "ModifiedDate": { "$gte": dateAfter(startdate) } },
                                            { "ModifiedDate": { "$lte": dateAfter(enddate) } }

                                        ]
                                    }
                                },
                                group = {
                                    $group: {
                                        _id: {
                                            year: { $year: "$ModifiedDate" },
                                            email_id: "$AppraiserID",
                                            company_name: "$CompanyName"
                                            // role_name: "$rolename"
                                        }, myCount: { $sum: 1 }
                                    }
                                },
                                { $match: { "_id.year": year } },
                                {
                                    $project: {
                                        _id: 0,
                                        "User ID": "$_id.email_id",
                                        "Valuation Count": "$myCount",
                                        "Company Name":  {"$ifNull" : ["$_id.company_name", ""] }
                                        // role_name: "$_id.role_name",
                                    }
                                }];
                        } else {
                            console.log("Match5")
                            query = [
                               // firstmatch,
                               {
                                $match: MatchQuery
                            },
                                // {
                                //     $lookup: {
                                //         from: "userlogs",
                                //         localField: "contact_details.email_id",
                                //         foreignField: "email_id",
                                //         as: "userlogs"
                                //     }
                                // },
                                // { $unwind: { path: "$userlogs" } },
                                group = {
                                    $group: {
                                        _id: {
                                            year: { $year: "$ModifiedDate" },
                                            email_id: "$AppraiserID",
                                            company_name: "$CompanyName",
                                            // role_name: "$rolename"
                                        }, myCount: { $sum: 1 }
                                    }
                                },
                                { $match: { "_id.year": year } },
                                {
                                    $project: {
                                        _id: 0,
                                        "User ID": "$_id.email_id",
                                        "Valuation Count": "$myCount",
                                        "Company Name":  {"$ifNull" : ["$_id.company_name", ""] }
                                        // role_name: "$_id.role_name",
                                    }
                                }];
                        }
                    }
                }
            }
            //if user searches without startdate and enddate option
            else {
                console.log("Match6")
                matchquery = {};
                group = {};
                //method used if user selects monthwise option
                if (jsonObj.searchtype == "monthwise") {
                    matchquery = { $match: { "_id.month": month,"_id.year": year } };
                    group = {
                        $group: {
                            _id: {
                                month: { $month: "$ModifiedDate" },
                                year: { $year: "$ModifiedDate" },
                                email_id: "$AppraiserID",
                                company_name: "$CompanyName"
                                // role_name: "$rolename"
                            }, myCount: { $sum: 1 }
                        }
                    };
                }
                 //method used if user selects monthwise option
                else if (jsonObj.searchtype == "yearwise") {
                    matchquery = { $match: { "_id.year": year } };
                    group = {
                        $group: {
                            _id: {
                                year: { $year: "$ModifiedDate" },
                                email_id: "$AppraiserID",
                                company_name: "$CompanyName"
                                // role_name: "$rolename"
                            }, myCount: { $sum: 1 }
                        }
                    };
                }
                // firstmatch = {};
                // if ("email_id" in jsonObj) {
                //     firstmatch = { $match: { "AppraiserID": jsonObj.email_id } };
                // } else {
                //     firstmatch = { $match: { "CompanyName": jsonObj.company_name } };
                // }
                //DB Query 
                query = [
                   // firstmatch,
                   {
                    $match: MatchQuery
                    },
                    // {
                    //     $lookup: {
                    //         from: "userlogs",
                    //         localField: "contact_details.email_id",
                    //         foreignField: "email_id",
                    //         as: "userlogs"
                    //     }
                    // },
                    // { $unwind: { path: "$userlogs" } },
                    group,
                    matchquery,
                    {
                        $project: {
                            _id: 0,
                            "User ID": "$_id.email_id",
                            "Valuation Count": "$myCount",
                            "Company Name": {"$ifNull" : ["$_id.company_name", ""] }
                            // role_name: "$_id.role_name",
                        }
                    }];
            }
        }
        // console.log("final query.. jsonObj.searchtype ="+JSON.stringify(query));
        collection.aggregate(query, { allowDiskUse: true }, function (err, user) {
            res.send(user)
          
            var logobj={};
            logobj.UserID= "UserID";
            logobj.Data = user;
            logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB   
        
            //console.log(user)
            res.end();
        }
        )
    }
    catch (ex) {
        logger.log('error',`${ex}`); // logging error into DB
     }
});
module.exports = router;


