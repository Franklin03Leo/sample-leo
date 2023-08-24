/* Fetch the Rolename from userroles collection */
var express = require('express');
var router = express.Router();
var logger= require('./logger');  // adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.get('/',verifyToken, function (req, res, next) 
{
    try{
    //DB Connection and its query
    const db = req.admin_db;
    const collection =db.collection('userroles');
    collection.find({rolename:{$ne:null}},{rolename:1,"_id":0})
    .then((docs) => {
      //  logger.log('info',`${JSON.stringify(docs)}`);
        var logobj={};
        logobj.UserID= "UserID"
        logobj.Data = docs;
        logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
    
        res.json(docs);
    }).catch((err) => {
        console.log("Error in retriving from DB "+ err);
        logger.log('error',`${err}`);  // logging error into DB
    })
}
catch(ex)
{
    logger.log('error',`${ex}`);  //logging error into DB
}
 });
module.exports = router;