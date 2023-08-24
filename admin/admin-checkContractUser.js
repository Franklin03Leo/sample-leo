
// To check the Company Name exist or not
var express = require('express');
const logger = require('./logger');   //adding loggers
var Router = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
Router.get('/',verifyToken, function (req, res, next) {
      //DB Connection and its query
  //  var strBody = req.body;
    var db = req.admin_db;
    var collection = db.collection('User');
// console.log("RRRRRR"+JSON.stringify(req.query))
  //  var companyname = strBody.companyname;   
    var   contractreference=req.query.contractreference
    contractreference
    try {
        // Query to check the companyname
        collection.find({
           // 'CompanyName': { $in: companyname },
            'UserName': { $ne: null },    //added
            'Contract.ContractReference':contractreference,
            "ApprovalDetails.Status": { $in: ["Approved"] },
           // "UserType": "Appraiser"
            // Would contain inactive users
        }, function (error, docs) {
            if (error) {
                res.send('1');  
                logger.log("error",`${error}`);   //logger error - added by SRINIVASAN
            //if error occurs '1' will be sent
            } if (docs == "") {
                res.send('2');
                var logobj={};//object initialization
                logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
                logobj.Data = "Contract users does not exists";//adding data to object
                // logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
              
                //if not exists '2' will be sent
            } else {
               
                var logobj={};//object initialization
                logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
                logobj.Data = "Contract users Already Exists ";//adding data to object
                // logger.log('info',`${JSON.stringify(logobj)}`);
             
         ;
                res.send('3');
               
            }
        });
    }
    catch (ex) {
       
        logger.log("error",`${ex}`);   //logger error - added by SRINIVASAN
     }
});
module.exports = Router;