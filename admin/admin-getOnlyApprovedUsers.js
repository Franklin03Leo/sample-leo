const express = require('express');
const logger = require('./logger');// Adding Loggers
const getCompanyUsers = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
getCompanyUsers.get('/',verifyToken, function (req, res, next) {
    try{
        //DB Connection & Query
        const db = req.admin_db;
        const coll = db.collection('User');
        /* Fetch the Username based on Company name selection which was in Approved status */
        coll.aggregate([
            {
                $match: {
                    'CompanyName':req.query.companyname,
                    "ApprovalDetails.Status": { $in: ["Approved"] }
                }
            },
            {
                "$project":
                    {
                        'ContactDetails.EmailID': 1, "_id": 0
                    }
            }
        ]).then((docs) => {
            res.send(docs);
            console.log(docs)
            logger.log('info',`${docs}`)
        }).catch((err) => {
            logger.log("error",`${err}`);
        });
    }
    catch(err){
        logger.log("error",`${err}`);
    }
});
module.exports = getCompanyUsers;