var express = require("express");
const logger = require("./logger");
var router = express.Router();
var verifyToken = require('../commonjs/Verify_JWT');//  To Verify Token

router.post('/', verifyToken, function (req, res, next) {

    try {
        var strBody = req.body;
        var jsonObj = strBody;
        var userId = jsonObj.userId;
        var CompanyName = jsonObj.CompanyName

        const db = req.admin_db;
        var collection = db.collection("User");

        collection.aggregate([{ $match: { 'UserID': userId } },
        {
            $lookup:
            {
                from: "Company",
                localField: "CompanyName",
                foreignField: "CompanyName",
                as: "CompanyDetails"
            }
        }]).then((docs) => {
            res.json(docs);
        }).catch((err) => {
            console.log("Error in retriving from DB" + err);
        }).then(() => db.close())

    } catch (ex) {
        logger.log('error', `${ex}`);  // logging error into DB
        console.log(ex);
    }
});
module.exports = router;