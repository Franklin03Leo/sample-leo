// Query to fetch the year from userlogs based on the user login time
const express = require('express');
const logger = require('./logger');  //adding loggers
const getYearFromUserlogs = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
getYearFromUserlogs.post('/',verifyToken, function (req, res, next) {
      
    try{
        //DB Connection and its query
        const db = req.db;
        const dashboard = req.body.dashboard;
        const companynames = req.body.companynames; 
        const coll = db.collection('Appraisal');
        if (!db || !db.collection) {
            res.json({});
            return;
        }
        ArrayMatchQuery = [];
        // Query to get the year
        if (dashboard == 'appraiseradmin') {
            ArrayMatchQuery.push({
                $match: { 'CompanyName': companynames } ,
           });      
        }
        ArrayMatchQuery.push({
             $project: { _id: 0, year: { $year: "$ModifiedDate" } } ,
        });
        ArrayMatchQuery.push({
            $group: { "_id": { "year": "$year" } },
        });
        ArrayMatchQuery.push({
            $project: { _id: 0, year: "$_id.year" } ,
        });
        ArrayMatchQuery.push({
            $sort: { year: -1 },
       });
        coll.aggregate(ArrayMatchQuery).then((docs) => {
            res.json(docs);
            var logobj={};//object initialization
            logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
            logobj.Data = docs;//adding data to object
            //logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
            //console.log(docs)
        }).catch((err) => {
         //   console.log('Error in retriving Years' + err);
            logger.log("error",`${err}`);  //logger error - addded by SRINIVASAN
        })
    }
    catch(err){
        logger.log("error",`${err}`);    //logger error - addded by SRINIVASAN
    }
});

module.exports = getYearFromUserlogs; 
