/* Fetch the Company details from 'company' & 'contracts' collection */
var express = require('express');
var Router = express.Router();
var logger= require('./logger');   //adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
Router.get('/',verifyToken, function (req, res, next) {
    //DB connection and its parameters
   try
   {
    var strBody = req.body;
    var companyname = req.query.companyname;
    var db = req.admin_db;
    var collection = db.collection('Company');
    if (!db || !db.collection) {
        console.log("collection not found");
        res.json({});
        return;
    }
        //DB Query
        collection.aggregate([{ $match: { "CompanyName": req.query.companyname } },
        {
            $lookup:
                {
                    from: "Contracts",
                    localField: "Contract.Contract_reference",
                    foreignField: "contract_reference",
                    as: "docs2"
                }
        }]).then((docs) => {
            var logobj={};
            logobj.UserID= "UserID"
            logobj.Data = docs;
            logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB      
       //     logger.log('info',`${JSON.stringify(docs)}`);
            res.json(docs);
        }).catch((err) => {
            logger.log('error',`${err}`);   //logging error into DB
            console.log("Error in retriving from DB" + err);
        }).then(() => db.close())
    }
    catch (ex) {
        logger.log('error',`${ex}`);   //logging error into DB
    }
});
module.exports = Router;