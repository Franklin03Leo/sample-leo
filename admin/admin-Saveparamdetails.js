var http = require("http");
var logger= require('./logger');   //Adding Loggers
var express = require('express');
var router = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
router.post('/',verifyToken, function(req, res, next) {
    try {
        var strBody = req.body;
        /*req.on("data", function(chunk) {
            strBody += chunk;
        });*/
       // req.on("end", function() {
            console.log("Received posted data: " + strBody);

            //Getting Param details.. 
            var jsonObj = strBody;
            var ParamID = jsonObj.ParamID;
            var ParentParamID = jsonObj.ParentParamID;
            var ParamName = jsonObj.ParamName;
            var ParamValue = jsonObj.ParamValue;
            var Editable = jsonObj.Editable;
            var ParamStatus = jsonObj.ParamStatus;
            var Update = jsonObj.Update;
			var UserAccess = jsonObj.UserAccess;
            var db = req.db;
            var collection = db.get('Param');
            collection.find({
                "ParamID": ParamID
            }, function(err, docs) {
				console.log("ParamID"+ParamID);
                console.log("docs");
                console.log("Editable          " + Editable);
				console.log("Update" +Update)
                
              //docs.forEach(function (doc) {
				  
				  console.log("Len"+docs.length)
				if(docs.length){
					console.log(docs[0].ParamID)
					if (docs[0].ParamID == ParamID) {
						console.log('true');
						console.log(ParamID);
						if (Update == "1") {
							collection.update({
								"ParamID": ParamID
							}, {
								$set: {
									"ParamName": ParamName,
									"ParamID": ParamID,
									"ParentParamID": ParentParamID,
									"ParamValue": ParamValue,
									"Editable": Editable,
									"ParamStatus": ParamStatus,
									"Access": UserAccess,
									"UserAccess":UserAccess
								}
							}, {
								upsert: true
                            });
                            
                            var logobj={};
                            logobj.UserID= "UserID";
                            logobj.Status= "Given Param Value Updated";
                            logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
							res.send('1');
						} else {
                            //res.write("2");
                            var logobj={};
                            logobj.UserID= "UserID";
                            logobj.Status= "Given Param Value not Found";
                            logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
							res.send('2');
						}
					} 
				}else {
                    console.log('false');
                    collection.update({             //Updating ParamName using its Param ID
                        "ParamID": ParamID
                    }, {
                        $set: {
                            "ParamName": ParamName,
                            "ParamID": ParamID,
                            "ParentParamID": ParentParamID,
                            "ParamValue": ParamValue,
                            "Editable": Editable,
                            "ParamStatus": ParamStatus,
                            "Access": "User",
							"UserAccess":UserAccess
                        }
                    }, {
                        upsert: true
                    });
                    console.log("Data written");
                    //res.write("1");
                    var logobj={};
                    logobj.UserID= "UserID";
                    logobj.Status= "Given Param Value Updated";
                    logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
                    res.send('1');
                }
                //});
            });
        //});
    } catch (ex) {
        logger.log('error',`${ex}`);   //adding error logs
        console.dir(ex);
    }
});
module.exports = router;