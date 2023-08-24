/* To Fetch the 'UnApproved' users from 'user' collection */
var express = require('express');
var router = express.Router();
var logger= require('./logger');   //adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.get('/',verifyToken, function (req, res, next) {
    //DB Connection 
    try{
    var db = req.admin_db;
    var project = db.collection('User');
    // Query to bind the data with UnApproved Status
    project.aggregate([
        { $match: { "ApprovalDetails.Status": "unApproved" } },
        { $unwind: { path: "$ApprovalDetails", preserveNullAndEmptyArrays: true } },
        { $sort: { 'CreatedDate': -1 } }
    ]).then((docs) => {
     //   logger.log('info',`${JSON.stringify(docs)}`);
        var logobj={};
        logobj.UserID= "UserID"
        logobj.Data = docs;
        //logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
    
        res.json(docs);
    }).catch((err) => {
        logger.log('error',`${err}`); //logging error into DB
        console.log("Error in retriving into DB " + err);
    }).then(() => db.close())
}
catch (ex) { 
    console.dir(ex);
    logger.log('error',`${ex}`); //logging error into DB
}
});
module.exports = router;