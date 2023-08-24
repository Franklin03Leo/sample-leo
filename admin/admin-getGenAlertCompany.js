var express = require("express");
const logger = require("./logger"); //Adding loggers
var router = express.Router();
var verifyToken = require("../commonjs/Verify_JWT"); //  To Verify Token
router.post("/", verifyToken, function (req, res, next) {
  try {
    var strBody = req.body;
    var jsonObj = strBody;
    var compnayname = [];
    compnayname = jsonObj.companyNames;

    //DB Connection

    const db = req.admin_db;
    const Companycoll = db.collection("Company");
    var query = [
      {
        $match: {
          CompanyName: { $in: compnayname },
        },
      },
      {
        $project: {
          Contract_reference: "$Contract.Contract_reference",
          _id: 0,
        },
      },

      {
        $unwind: "$Contract_reference",
      },
      {
        $match: {
          $and: [
            {
              "Contract_reference.alert": "Yes",
            },
            // {
            // "Contract_reference.Enddate" : { "$gte": new Date().toLocaleDateString() }
            // }
          ],
        },
      },
    ];
    Companycoll.aggregate(query, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        var result_2 = []
        if(result.length >= 1){
          for (let i = 0; i < result.length; i++) { // check wheter the contract date is valid or not
           if(new Date(result[i].Contract_reference.Enddate) >= new Date()){
          //  if(new Date(result[i].Contract_reference.Enddate).toLocaleDateString() >= new Date().toLocaleDateString()){
            result_2.push(result[i])
           }
          }
          // console.log("result_2",result_2);
          res.send(result_2);
        }
        else{
          // console.log("result",result);
          res.send(result)
        }
      }
    });
  } catch (err) {
    logger.log("error", `${err}`);
  }
});
module.exports = router;
