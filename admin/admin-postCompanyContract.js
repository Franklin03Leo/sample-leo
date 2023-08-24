// Insert company contract details in the 'contract' collection
var express = require('express');
var path = require("path");
var app1router = express.Router();
var jwt = require('jsonwebtoken');
var logger= require('./logger'); //adding logger
var tokenGeneration = require('../menu&home/getWebTokens');
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
app1router.post('/', verifyToken,function (req, res) {
try{
 console.log("Contract Register")
    //DB Connection and its query
    const db = req.admin_db;
    const coll =db.collection('Contracts');
    const validstartdate = new Date (req.body.valid_start_date);
    const validenddate = new Date (req.body.valid_to_date);
	let timeDiff = validenddate.getTime() - validstartdate.getTime();
    let DaysDiff = timeDiff / (1000 * 3600 * 24);
    let webtoken;
    let expday
    if(DaysDiff == 0) {
        expday = '1d'
    } else {
        expday = DaysDiff+'d';
    }
    console.log(DaysDiff)
    var user = {
        contract_ID : req.body.contract_reference,
    }
    // jwt.sign({ user }, 'secretkey', { expiresIn: '120s' }, (err, token) => {
    //     // res.json({
          
    //       webtoken = token
    //       console.log(webtoken)
    //     // });
    // });

    // function token(user)
    // {
    const webTokenPromise = tokenGeneration(user,expday);
    const generateToken = new Promise((resolve, reject) => {
        webTokenPromise.then(docs => {
            console.log(docs +'1231144')
            webtoken = docs
            resolve(docs)
        }).catch((err) => {
            reject(err)            // If error occurs '3' will be sent
        });
    })
    // }
    console.log(webtoken +"WEB")
    const promiseResolve = [generateToken];
    Promise.all(promiseResolve).then(function (values) {
        console.log("sadf")
        coll.insert({ 
            contract_reference: req.body.contract_reference,
            contract_description: req.body.contract_description,
            contract_date: new Date (req.body.contract_date),
            valid_start_date: new Date (req.body.valid_start_date),
            valid_to_date: new Date (req.body.valid_to_date),
            max_allowed_logins: req.body.max_allowed_logins,
            general_alert_flag: req.body.general_alert_flag,
            web_token : webtoken,
            token_exp_days : expday,
            CreatedDate: new Date(),
            LastUpDate: new Date(),
            last_updated_by: req.body.last_updated_by
        }),  function (err, app1) {
            if (app1) {
                res.json(app1);
                var logobj={};
                logobj.UserID= "UserID"
                logobj.Data = app1;
                logger.log('info',`${JSON.stringify(logobj)}`); // Logging data into DB
            
             //   logger.log('info',`${JSON.stringify(app1)}`);
                console.log('INSERTED!!!');
            }
            if (err) 
            {
                console.log('Error in inserting contract details' + err);
                logger.log('error',`${err}`);  //logging error into DB             
            }
                    };
    })
    // const webTokenPromise = tokenGeneration(user);
    // webTokenPromise.then(docs => {

        // coll.insert({ 
        //     contract_reference: req.body.contract_reference,
        //     contract_description: req.body.contract_description,
        //     contract_date: new Date (req.body.contract_date),
        //     valid_start_date: new Date (req.body.valid_start_date),
        //     valid_to_date: new Date (req.body.valid_to_date),
        //     max_allowed_logins: req.body.max_allowed_logins,
        //     general_alert_flag: req.body.general_alert_flag,
        //     web_token : webtoken,
        //     CreatedDate: new Date(),
        //     LastUpDate: new Date(),
        //     last_updated_by: req.body.last_updated_by
        // }),
        // function (err, app1) {
        //         if (app1) {
        //             res.json(app1);
        //             console.log('INSERTED!!!');
        //         }
        //         if (err) console.log('Error in inserting contract details' + err);
        //     });
        // })
      //  res.send("1");
        // If inserted into DB & mail sent '1' will be sent
   // }).catch((err) => {
    //    res.send("3");
        // If error occurs '3' will be sent
  //  });

    // coll.insert({ 
    //     contract_reference: req.body.contract_reference,
    //     contract_description: req.body.contract_description,
    //     contract_date: new Date (req.body.contract_date),
    //     valid_start_date: new Date (req.body.valid_start_date),
    //     valid_to_date: new Date (req.body.valid_to_date),
    //     max_allowed_logins: req.body.max_allowed_logins,
    //     general_alert_flag: req.body.general_alert_flag,
    //     web_token : webtoken,
    //     CreatedDate: new Date(),
    //     LastUpDate: new Date(),
    //     last_updated_by: req.body.last_updated_by
    // }, function (err, app1) {
    //     if (app1) {
    //         res.json(app1);
    //         console.log('INSERTED!!!');
    //     }
    //     if (err) console.log('Error in inserting contract details' + err);
    // });
}
catch(ex)
{
    console.log(ex);
    logger.log('error',`${ex}`); //logging error into DB
}
});

module.exports = app1router;
