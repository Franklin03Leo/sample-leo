/* Fetch the contract reference based on company selection from 'company' collection */
var express = require('express');
var router = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token

router.get('/', verifyToken,function (req, res, next) {
    var strBody = req.query;
    //DB connection and its parameters
    var db = req.admin_db;
    var collection = db.get('Company');
    var compName = strBody.companyname;
    var tempObj = {};
    tempObj["$match"] = { CompanyName: compName };
    var ProjectObj = {};
    ProjectObj["$project"] = {"references": "$Contract.Contract_reference", _id: 0};
try {
    collection.aggregate([tempObj, ProjectObj],
    function (err, result) {
        if (err) {
            console.log(err);
        } else {
            var arr = [];
            var obj = {
                status: 'valid'
            }
            for(var x=0; x<result.length; x++)
            {
                var reference = result[x]["references"];
                for(var y=0; y<reference.length; y++)
                {
                    arr.push(reference[y]);
                }
            }
            res.send(arr);
        }
    });
}
catch (ex) {
}
});
module.exports = router;