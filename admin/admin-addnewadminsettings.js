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
        var db = req.admin_db;
        var collection = db.get('Param_New');
        
        if (FromSection == 'New') {
           
            collection.find({
                "paramid": ParamID, "field": ParamName
            }, function (newcollerr, newcolldocs) {
                if (newcollerr) {
                    console.log('Error' + err);
                    res.send('2');
                }
                else if (newcolldocs.length != 0) {
                    
                    console.log("Data Already Exists");
                    res.send('3');
                }
                else if (newcolldocs.length == 0) {
                    var keystringvalues = '';
                    keystringvalues = 'values.' + ParamValue;
                            collection.insert(
                                {                                   
                                    "paramid" : ParamID,
                                    "field" : ParamName,
                                    "values":{
                                        [ParamValue]: {
                                            "status": ParamStatus,
                                            "editable": Editable
                                        }
                                    },
                                    "status" : ParamStatus,
                                    "editable" : Editable
                                }
                            ); res.send('1')
                   
                }
            });
        }
        else {
            if (ParamName.includes('Amenities')) {
                var names = ParamName.split('-');
                collection.find({
                    "paramid": ParamID, "field": names[0]
                }, function (amenititeserr, amenitiesdocs) {
                    if (amenititeserr) {
                        console.log('Error' + amenititeserr);
                        res.send('2');
                    }
                    if (amenitiesdocs) {
                        var amenitiesdocval = '';
                        amenitiesdocval = 'values.' + names[1] + '.' + names[2] + '.' + ParamValue;
                        collection.find({
                            "paramid": ParamID, "field": names[0],
                            [amenitiesdocval]: { $exists: true }
                        }, function (amenitieserr, amenitiesresdocs) {
                            if (amenitiesresdocs.length != 0) { res.send('3') }
                            else if (amenitieserr) { res.send('2') }
                            else if (amenitiesresdocs.length == 0) {
                                var amenikeystringvalues = '';
                                amenikeystringvalues = 'values.' + names[1] + '.' + names[2] + '.' + ParamValue;
                                collection.update(
                                    {
                                        "paramid": ParamID
                                    },
                                    {
                                        $set: {
                                            [amenikeystringvalues]: {
                                                "status": ParamStatus,
                                                "editable": Editable
                                            },
                                        }
                                    }
                                ); res.send('1')
                            }
                        });
                    }
                });
            }
            if (ParamName == 'Valuation Summary') { ParamName = 'ValuationSummary' }
            
            collection.find({
                "paramid": ParamID, "field": ParamName
            }, function (err, docs) {
                if (err) {
                    console.log('Error' + err);
                    res.send('2');
                }
                if (docs) {
                    var docval = '';
                    if (FromSection == 'Valuation' || FromSection == 'Valuation Summary' || FromSection == 'Others') {
                        docval = 'values.' + ParamValue;
                    }
                    if (FromSection == 'interior' || FromSection == 'exterior' ) {
                        docval = 'values.' +ParamName+'.'+ ParamValue;
                    }
                    collection.find({
                        "paramid": ParamID, "field": ParamName,
                        [docval]: { $exists: true }
                    }, function (err, resdocs) {
                        if (resdocs.length != 0) { res.send('3') }
                        else if (err) { res.send('2') }
                        else if (resdocs.length == 0) {
                            var keystringvalues = '';
                            if (FromSection == 'interior' || FromSection == 'exterior') {                               
                                keystringvalues = 'values.'+ ParamName + '.' + ParamValue;
                            }
                            else {  keystringvalues = 'values.' + ParamValue;}
                           
                            collection.update(
                                {
                                    "paramid": ParamID
                                },
                                {
                                    $set: {
                                        [keystringvalues]: {
                                            "status": ParamStatus,
                                            "editable": Editable
                                        },
                                    }
                                }
                            ); res.send('1')
                        }
                    });
                    
                    
                }
                //if (docs.length != 0) { res.send('3') }
                else if (!docs && FromSection != '') {
                    var keystringvalues = '';
                    keystringvalues = 'values.' + ParamValue;
                    collection.update(
                        {
                            "paramid": ParamID
                        },
                        {
                            
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
                else if (!docs && FromSection == '') {
                    var keystringvalues = '';
                    keystringvalues = 'values.' + ParamValue;
                    collection.insert(
                        {
                            "paramid": ParamID,
                            "field": ParamName,
                            "status": "Active",
                            "editable": "Y",
                            [keystringvalues]: {
                                "status": ParamStatus,
                                "editable": Editable
                            }
                        },
                        function (err, docs) {
                            if (err) {
                                console.log(err);
                                res.send(err);
                            
                            } else {
                                try {
                                    res.send("1");
                              
                                } catch (error) {
                             
                                }
                            }
                        }
                    );
                   
                    res.send('1');
                }
                else if (err) { res.send('2'); }
               
            });
       
        }
    } catch (ex) {
        
        console.dir(ex);
    }
});
module.exports = router;