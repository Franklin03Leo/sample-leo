/* To Fetch the username from 'user' collection */
const express = require('express');
const getUsers = express.Router();
var logger= require('./logger');   //adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
getUsers.post('/',verifyToken,function (req, res, next) {
      //DB Connection and its query
      // To Fetch the username 
      try{
          const db = req.admin_db;
          const dashboard = req.body.dashboard;
          const companynames = req.body.companynames;
          const coll = db.collection('User');
          if (dashboard == 'appraiseradmin') {
              matchquery = {};
              matchquery = {
                  $match: {
                  
                      "ApprovalDetails.Status": "Approved",
                      "UserType": "Appraiser",
                      'UserName': { $ne: null },    //added,
                      'CompanyName': companynames
                    
                  }
              }
          }
          else { 
            matchquery = {};
            matchquery = {
                $match: {
                
                    "ApprovalDetails.Status": "Approved",
                    "UserType": "Appraiser",
                    'UserName': { $ne: null }
                }
            }
          }
          coll.aggregate([
            matchquery,
        // {
        //     $match: {
              
        //         "ApprovalDetails.Status": "Approved",
        //         "UserType": "Appraiser",
        //         'UserName': { $ne: null },    //added
        //         // $and: [
        //         //     { "UserType": { $nin: ["Lender", "Borrower", "Admin"] } },
        //         //     { "ApprovalDetails.Status": "Approved" }

        //         // ]
        //     }
        // },
        {
            "$project":
                {
                    'ContactDetails.EmailID': 1,'UserName': 1,'CompanyName':1, "_id": 0 ,
                         //UserName added by Saranya  (Instead of ContactDetails.EmailID)
                }
        }
    ]).then((docs) => {    
        res.send(docs);
        
     //   logger.log('info',`${JSON.stringify(docs)}`);
        var logobj={};
        logobj.UserID= "UserID"
        logobj.Data = docs;
       // logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
    
    }).catch((err) => {
        logger.log('error',`${err}`);  //logging error into DB
        console.log("Error in retrieving data from DB " + err);
    });
}
catch(ex){
    logger.log('error',`${ex}`);  //logging error into DB
    console.log(ex)
}
});
module.exports = getUsers;