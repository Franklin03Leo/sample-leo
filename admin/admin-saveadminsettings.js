var http = require("http");
var express = require('express');
var router = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.post('/',verifyToken, function(req, res, next) {
    try {
        var strBody = req.body;        
            // console.log("Received posted data: " + strBody);
            //Getting Param details.. 
            var jsonObj = strBody;
            var ParamID = jsonObj.paramid;
            var ParamName = jsonObj.paramname;
            var ParamValue = jsonObj.paramvalue;
            var Editable = jsonObj.Editable;
            var ParamStatus = jsonObj.paramstatus;
            var FromSection = jsonObj.fromsection;
            var oldparamval = jsonObj.oldparamval;
        
            var db = req.admin_db;
        var collection = db.get('Param_New');
            collection.find({
                "paramid": ParamID
            }, function(err, docs) {
				if(docs.length){
					if (docs[0].paramid == ParamID) {			
                        if (FromSection == 'idletimeout' || FromSection == 'sessiontimeout') {
                            
                            collection.update({
                                "paramid": ParamID
                            }, {

                                $set: {
                                    "field": ParamName,
                                    "paramid": ParamID,
                                    "values": ParamValue,
                                    "editable": Editable,
                                    "status": ParamStatus
                                }
                            }, {
                                upsert: true
                            });
                            
                           
                        res.send('1');
                        }
                        else if (FromSection == 'valuation' || FromSection == 'valuationsum' || FromSection == 'Land' || FromSection == 'Building' || FromSection == 'Apartment' || FromSection == 'Others'|| FromSection == 'interior'|| FromSection == 'exterior') {
                            
                            var keystringvalues = '';
                            if (FromSection == 'valuation' || FromSection == 'valuationsum'
                                || FromSection == 'Others') {
                                    keystringvalues = 'values.' + ParamValue;
                                oldparamval = 'values.' + oldparamval;
                            }
                            if (FromSection == 'Land' || FromSection == 'Building' || FromSection == 'Apartment') {
                                keystringvalues = 'values.' + FromSection + '.' + ParamName + '.' + ParamValue;
                                oldparamval = 'values.' + FromSection + '.' + ParamName + '.' + oldparamval;
                            }
                            if (FromSection == 'interior' || FromSection == 'exterior') {
                                keystringvalues = 'values.'  + ParamName + '.' + ParamValue;
                                oldparamval = 'values.'  + ParamName + '.' + oldparamval;
                             }                           
                            collection.update(
                                {
                                    "paramid": ParamID
                                },
                                {
                                    $unset: {
                                        [oldparamval]: 1
                                    },
                                    $set: {
                                        [keystringvalues]: {
                                            "status": ParamStatus,
                                            "editable": Editable
                                        },
                                    }
                                }
                            );
                           
                            res.send('1');
                        }
                        else if (err) {
                            
                            res.send('2');
                        }
                        else { 
                            keystringvalues = 'values.' + ParamValue;
                            oldparamval = 'values.' + oldparamval;
                            collection.update({             //Updating ParamName using its Param ID
                                "paramid": ParamID
                            }, {
                                $unset: {
                                    [oldparamval]: 1
                                },
                                $set: {
                                    [keystringvalues]: {
                                        "status": ParamStatus,
                                        "editable": Editable
                                    },
                                }
                            }, {
                                upsert: true
                            });
                            console.log("Data written");
                            
                            res.send('1');
                        }
                    }
                         }else {                    collection.update({             //Updating ParamName using its Param ID
                        "paramid": ParamID
                    }, {
                        $set: {
                            "field": ParamName,
                            "paramid": ParamID,									
                            "values": ParamValue,
                            "editable": Editable,
                            "status": ParamStatus
                        }
                    }, {
                        upsert: true
                    });
                    console.log("Data written");
                    
                    res.send('1');
                }
                //});
            });
        //});
    } catch (ex) {
        
        console.dir(ex);
    }
});
module.exports = router;