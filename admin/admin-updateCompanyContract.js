// To update the company contract details
var express = require('express');
var path = require("path");
var mailService = require('../commonjs/admin-mail');
let strEmail = '';
var logger= require('./logger');   //adding loggers
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
var updaterouter = express.Router();
var companyname = '';
updaterouter.post('/',verifyToken, function (req, res, i) {
try{
   
    const db = req.admin_db;
    const coll = db.collection('Contracts');
   console.log("Contracts details"+JSON.stringify(req.body))
    // With Contract reference as a key element, other details are updated in the contracts collection 
    for (let obj of req.body) {
       // console.log(req.body,"Body element")
        if (obj.contract_reference != null && obj.contract_reference != "" && obj.contract_reference != undefined) {
         companyname = obj.companyName;
            coll.update({
                contract_reference: obj.contract_reference
            },
                {
                    $set: {
                        "contract_reference": obj.contract_reference,
                        "contract_description": obj.contract_description,
                        "contract_date": obj.contract_date,
                        "valid_start_date": obj.valid_start_date,
                       "valid_to_date": obj.valid_to_date,
                        "max_allowed_logins": obj.max_allowed_logins,
                        "general_alert_flag": obj.general_alert_flag,
                        "LastUpDate": new Date(),
                        "last_updated_by": obj.last_updated_by
                    }
                },
                { upsert: true },function(err,docs){
                    if(err){
                        console.log(err);
                        var logobj={};//object initialization
                        logobj.UserIDpdate= "User";//req.body.lastupdatedby;//adding userid to object
                        logobj.Data = err;//adding data to object
                        logger.log('info',`${JSON.stringify(logobj)}`)
                    

                    }
                    else{
                        console.log(docs,"Document")
                        var logobj={};//object initialization
                        logobj.UserIDpdate= "User";//req.body.lastupdatedby;//adding userid to object
                        logobj.Data = docs;//adding data to object
                        logger.log('info',`${JSON.stringify(logobj)}`)
                      
                    console.log("Contract"+JSON.stringify(docs))
                    }
                }
            );
        }
    }
      res.send('1');
    
}
catch(ex){
    logger.log('error',`${ex}`);
}
});
module.exports = updaterouter;