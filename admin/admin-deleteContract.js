var http = require("http");
var logger= require('./logger');   //adding loggers
var express = require('express');
var router = express.Router();
//"Measurement,PropertyType"
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.post('/',verifyToken , function(req, res, next) {
    try {
        var strBody = req.body;
        // console.log("Received posted data: " + strBody);
        var jsonObj = strBody;
        var contract = jsonObj.contract;
        // console.log("___"+contract);
        // console.log("Connected to Database Contracts_copy"+contract[0]);
        var db = req.admin_db;
        var coll = db.collection('Contracts');
        // console.log("Connected to Database Contracts_copy:  "+ contract)
        // var myquery = { "contract_reference" : contract };
        // console.log("myquery",myquery  );
    setTimeout(() => {
        contract.forEach(element => {
            coll.remove({"contract_reference":element}, function(err, obj) {
                if(err){
                    console.log(err);
                }
                else{
                    // console.log(obj);
                    // console.log("--->",JSON.stringify(obj));
                }
            }) 
        });
    }, 500);
res.send('1');
     } catch (Ex) {
         logger.log('error',`${Ex}`);
     console.log("connection error");
     }
});
module.exports = router;