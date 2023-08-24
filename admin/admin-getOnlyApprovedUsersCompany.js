/* Fetch the company name based on username selection */
const express = require('express');
const getUsersCompany = express.Router();
var logger= require('./logger');   //adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
getUsersCompany.get('/',verifyToken,function (req, res, next) {
    try{
        
    //DB Connection & Query to get the companyname
    const db = req.admin_db;
    const coll = db.collection('User');
   
    coll.aggregate([
        {
            $match: {
                "ContactDetails.EmailID": req.query.username,
                "ApprovalDetails.Status": { $in: ["Approved"] }
            }
        },
        {
            "$project":
                {
                    'CompanyName': 1, "_id": 0
                }
        }
    ]).then((docs) => {
     //   logger.log('info',`${JSON.stringify(docs)}`);
        var logobj={};
        logobj.UserID= "UserID"
        logobj.Data = docs;
        logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
    
        res.send(docs);
    }).catch((err) => {
        logger.log('error',`${err}`); // logging error into DB
        console.log("Error in retriving Companyname from DB " + err);
    }); 
}
catch (ex) {
    logger.log('error',`${ex}`);  // logging error into DB
}
});
module.exports = getUsersCompany;