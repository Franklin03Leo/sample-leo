let http = require("http");
let logger= require('./logger');
let express = require('express');
let router = express.Router();
let verifyToken=require('../commonjs/Verify_JWT');
const { json } = require("body-parser");
router.post('/',verifyToken , function(req, res, next) {
    try {
        let strBody = req.body;
        let companyType = strBody.companyType;
        let CompanyType = ''
        if(companyType == 'Valuer Company'){
            CompanyType = 'Lender'
        }else{
            CompanyType = 'Valuer Company'
        }
        var db = req.admin_db;
        let collection = db.get('Company');
        let query = [
          { $match: { CompanyType: CompanyType } },
          {
            $project: {
              CompanyName: "$CompanyName",
              branches: "$CompanyBranchDetails",
            },
          },
        ];
        collection.aggregate(query).then((result)=>{
            // console.log('data', result)
            res.send(result)
        })
        
    } catch (err) {
        logger.log('error',`${err}`);
        console.log("connection error");
        res.send('0')
    }
});
module.exports = router;