// To fetch the Company Name from DB
var express = require('express');
var router = express.Router();
var logger= require('./logger'); // adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token

router.post('/',verifyToken, function (req, res, next) {
    try{
    //DB connection
        const db = req.admin_db;
        const companyname = req.body.companyname;
        const datafetch = req.body.datafetch;
        const coll = db.collection('Company');
        var query = [];
    // Query to get all the companyname from company collection 
        if (datafetch == 'All') { 
             query = [{$match:{CompanyName:{$ne:null}}},{$project:{CompanyName:1,"_id":0}},{$sort:{CompanyName:1}}];
        }
        else if (datafetch == 'Company') {
             query = [{ $match: { CompanyName: companyname } }, { $project: { CompanyName: 1, "_id": 0 } }, { $sort: { CompanyName: 1 } }];
        }
else if(datafetch=='Valuer'){
  //datafetch=='Valuer' added in Admin dashboard-CompanyName dropdown
        if(req.body.userRole=="Admin")
            query = [{$match:{CompanyName:{$ne:null},'CompanyType':{$ne:'Lender'}}},{$project:{CompanyName:1,"_id":0}},{$sort:{CompanyName:1}}];
        else
    query = [{ $match: { CompanyName: companyname,'CompanyType':{$ne:'Lender'} } }, { $project: { CompanyName: 1, "_id": 0 } }, { $sort: { CompanyName: 1 } }];
}
   // var query = [{$match:{CompanyName:{$ne:null}}},{$project:{CompanyName:1,"_id":0}},{$sort:{CompanyName:1}}];
    coll.aggregate(query)
    .then((docs) => {
        res.send(docs);
        var logobj={};
        logobj.UserID= "UserID"
        logobj.Data = docs;
     //   logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
    
      //  logger.log('info',`${JSON.stringify(docs)}`);   //logging data into DB
      
    }).catch((err) => {
        logger.log('error',`${err}`);   //logging error into DB
        console.log("Error companyname"+ err);
    })
    }
    catch(ex){
        logger.log('error',`${ex}`);   //logging error into DB 
    }
});
module.exports = router;