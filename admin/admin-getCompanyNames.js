/* Fetch the valid contract companyname for binding the Company dropdown in (Single,Bulk User Creation, UserApproval Screens) */
var express = require('express');
var router = express.Router();
var logger = require('./logger');  //adding logger
var verifyToken = require('../commonjs/Verify_JWT');//  To Verify Token
router.get('/', verifyToken, function (req, res, next) {
    try {
        //DB Connection
        const db = req.admin_db;
        const coll = db.collection('Company');
        console.log("Company Names");
        //DB Query to retrive CompanyName which has VALID valid_to_date
        //'CompanyType':{$ne:'Lender'} added by saranya to remove lender company
        coll.aggregate([{ $match: { "CompanyName": { $ne: null },'CompanyType':{$ne:'Lender'} } },
        {
            $lookup: {
                from: "Contracts",
                localField: "Contracts.contract_reference",
                foreignField: "Contracts.contract_reference",
                as: "docs"
            }
        },
        {
            "$unwind": "$docs"
        },
        {
            "$project": {
                temp: {
                    "company_name": {
                        $cond:
                            [
                                { $gte: ["$docs.valid_to_date", new Date()] },
                                "$CompanyName",
                                null
                            ]
                    }
                },
                "contract_reference": "$docs.contract_reference",
                "valid_to_date": "$docs.valid_to_date",
                _id: 0
            }
        },
        {
            "$group": {
                _id: "$temp.company_name",
                contract_reference: { $addToSet: "$contract_reference" },
                valid_to_date: { $addToSet: "$valid_to_date" },
            }
        }],
            function (err, docs) {
                if (err) {
                    logger.log('error', `${err}`); //logging error into DB
                    console.log(err);
                } else {
                    var arr = [];
                    const result = [...docs.filter(res => res['_id'] !== null)];
                    for (const res of result) {
                        arr.push({ 'companyname': res['_id'] });
                    }
                    res.send(arr);
                    var logobj = {};
                    logobj.UserID = "UserID"
                    logobj.Data = docs;
                    //    logger.log('info', `${JSON.stringify(logobj)}`); // Logging data into DB
                }
            });
    }
    catch (ex) {
        console.dir(ex);
        logger.log('error', `${ex}`); //logging error into DB
    }
});
module.exports = router;    