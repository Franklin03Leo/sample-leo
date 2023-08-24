var http = require("http");
var express = require('express');
var router = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.post('/',verifyToken , function(req, res, next) {
    try {
            var strBody = req.body; 
            var jsonObj = strBody;
            var ParamID = jsonObj.paramid;
            var fromsection = jsonObj.fromsection;
            var keyvalues = jsonObj.values;           
            var db = req.admin_db;
            var coll = db.get('Param_New');                                         
            coll.find({
                'paramid': ParamID             
            }, function(err, result) {
                if (err) {
                    console.log(err);
                    logger.log('error',`${ex}`);   
                } else if (result.length) {
                    if (fromsection == 'idletimeout' || fromsection == 'sessiontimeout') {
                        coll.update({
                        'paramid': ParamID
                    }, {
                        $set: {
                            'status': "InActive"
                        }
                    }) }
                    else if (fromsection == 'valuation' || fromsection == 'valuationsum'||
                    fromsection == 'Land' || fromsection == 'Building' || fromsection == 'Apartment'
                    || fromsection == 'Others' || fromsection == 'Interior' || fromsection == 'Exterior') {
                        var keystring =  '';
                        keystring = 'values.' + keyvalues + '.status';                                              
                        coll.update({
                            'paramid': ParamID
                        }, {
                            $set: {
                                [keystring]: "InActive"
                            }
                        })                        
                    }
                     
                }               
                console.log("Deleted the param")            
                res.send("1");
            })
    } catch (Ex) {
        logger.log('error',`${err}`);
        console.log("connection error");
    }
});
module.exports = router;