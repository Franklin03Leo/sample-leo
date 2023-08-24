const express = require('express');
const logger = require('./logger');   //aading loggers
const getCompanyUsers = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
getCompanyUsers.get('/',verifyToken, function (req, res, next) {
    //DB Connection
    try{
        const db = req.admin_db;
        const coll = db.collection('User');
        var companynames = new Array();
        //console.log(req);
       companynames=JSON.parse(req.query.companyname);
      
     //    companynames=([req.query.companyname.slice(1,-1)]);
           //console.log("CompanyName ="+companynames);
      /* To Fetch the username for the selected company from 'user' collection */
        //DB Query
        coll.aggregate([
            {
                $match: {
                    'CompanyName': { $in: companynames },
                    'UserName': { $ne: null },    //added
                    "ApprovalDetails.Status": { $in: ["Approved"] },
                    'UserType': {$ne: 'Borrower'}
                    
                    // Would contain inactive users
                }
            },
            {
                "$project":
                    {
                        'ContactDetails.EmailID': 1,'UserName': 1,'UserType':1, "_id": 0   //username
                    }
            }
        ]).then((docs) => {
            //logger info starts here - added by SRINIVASAN
            var logobj={};//object initialization
            logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
            logobj.Data = docs;//adding data to object
            //logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
            //logger info ends here - added by SRINIVASAN
            res.json(docs);
        }).catch((err) => {
            //console.log("Error in retriving data from DB " + err);
            // logger error - added by SRINIVASAN
            logger.log("error",`${err}`);
        });
    }
    catch(err){
        //logger error - added by SRINIVASAN
        logger.log("error",`${err}`);
    }
});
module.exports = getCompanyUsers;