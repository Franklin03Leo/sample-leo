/* To Fetch the username from 'user' collection */
const express = require('express');
const getUsers = express.Router();
var logger= require('./logger');  //adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
getUsers.post('/',verifyToken,function (req, res, next) {
    try{  
    //DB Connection and its query
    /* To Fetch the username from 'user' collection */
        const db = req.admin_db;
        const companyname = req.body.companyname;
        const datafetch = req.body.datafetch;
        const coll = db.collection('User');
        var query = [];
        if (datafetch == 'All') { 
            query = [{ $match: { 'UserName': { $ne: null }, "ApprovalDetails.Status": "Approved" } },
                     {"$project":{'ContactDetails.EmailID': 1,'UserName': 1,'UserType':1,'CompanyName':1, "_id": 0 }}]
       }
       else if (datafetch == 'Company') {
        query = [{ $match: { CompanyName: companyname, 'UserName': { $ne: null }, "ApprovalDetails.Status": "Approved" } },
        {"$project":{'ContactDetails.EmailID': 1,'UserName': 1,'UserType':1,'CompanyName':1, "_id": 0 }}]
       }
    coll.aggregate(query).then((docs) => {
        res.json(docs);
        var logobj={};
        logobj.UserID= "UserID"
        logobj.Data = docs;
     //   logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
   
    }).catch((err) => {
        logger.log('error',`${err}`); //Logging error into DB
        console.log("Error in retrieving data from DB " + err);
    });
}
catch(ex){
    logger.log('error',`${ex}`);  //logging error into DB
    console.log(ex)
}
});
module.exports = getUsers;