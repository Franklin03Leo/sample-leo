var http = require("http");
var express = require('express');
var router = express.Router();
var logger = require('./logger');  //adding loggers
router.post('/', function (req, res, next) {
    try {
        var strBody = req.body;
        var jsonObj = strBody;
        var ParentParamID = jsonObj.ParentParamID;
        var ParamName = jsonObj.ParamName;
        //db connection
        var db = req.admin_db;
        var coll = db.get('Param_New');

        /*To fretch Param Data From Param Collection*/
        coll.find({
            'paramid': parseInt(ParentParamID), 'field': ParamName, 'status': 'Active'
        }, function (err, result) {
            if (err) {
                logger.log("error", `${err}`);
            } else if (result.length) {
                var arr = JSON.stringify(result);
                var logobj = {};
                logobj.UserIDParamAppraisal = "dummyuserName@analyticBrains.com";
                logobj.Data = result;
                res.send(arr);
            } else {
                var logobj = {};
                logobj.UserID = "dummyuserName@analyticBrains.com";
                logobj.Data = 'No document(s) found with defined "find" criteria!';
                console.log('No document(s) found with defined "find" criteria!');
            }
        })
    } catch (Ex) {
        logger.log("error", `${Ex}`);
    }
});
module.exports = router;