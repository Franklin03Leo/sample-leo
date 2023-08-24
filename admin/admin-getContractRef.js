/* Fetch the valid contract reference for the selected company from 'company' collection */
var express = require('express');
var router = express.Router();
var logger= require('./logger'); //adding logger
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.get('/',verifyToken, function (req, res, next) {
    try {
    //DB connection and its parameters
    var strBody = req.query;
    var db = req.admin_db;
    var collection = db.get('Company');
    var compName = strBody.companyname;
    let tdyDate = new Date();
        tdyDate = JSON.stringify(tdyDate.toISOString());
    var tempObj = {};
    tempObj["$match"] = { companyname: compName };
    var ProjectObj = {};
    ProjectObj["$project"] = { "references": "$Contract.Contract_reference", _id: 0 };

   
        //DB Query
        collection.aggregate([{ $match: { "CompanyName": compName } },
        {
            $lookup: {
                from: "Contracts",
                localField: "Contract.Contract_reference.reference",
                foreignField: "contract_reference",
                // localField: "Contract.Contract_reference",
                // foreignField: "contract_reference", 
                as: "docs"
            }
        },
        {
            "$unwind": "$docs"
        },
        {
            "$group": {
                _id: {
                    "contract_reference": "$docs.contract_reference",
                    "valid_to_date": "$docs.valid_to_date"
                }
            }
        },
        {
            $project: {
                "_id": 0,
                "contract_reference":
                    {
                        $cond:
                            [
                                { $gte: ["$_id.valid_to_date", tdyDate] },
                                "$_id.contract_reference",
                                null
                            ]
                    }
            }
        }],
            function (err, docs) {
                if (err) {
                    logger.log('error',`${err}`);  //logging error into DB
                    console.log(err);
                } else {
                    var arr = [];
                    const result = [...docs.filter(res => res.contract_reference !== null)];
                    console.log("DFSDFFDSDFDFFDDFDSF"+JSON.stringify(result))
                    for (const res of result) {
                        arr.push(res['contract_reference']);
                    }
                  //  console.log(arr);
                    var logobj={};
                    logobj.UserID= "UserID"
                    logobj.Data = docs;
                    logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
                
                  //  logger.log('info',`${JSON.stringify(docs)}`);
                    res.send(arr);
                }
            });
    }
    catch (ex) {
        logger.log('error',`${ex}`);  //logging error into DB
        console.dir(ex);
    }
});
module.exports = router;