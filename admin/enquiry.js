/*This js used for to save the contact us and Pricing details from webs*/
// console.log("cLL");
var http = require("http");
var express = require('express');
var router = express.Router();

router.post('/' , function(req, res, next) {
  try { 
			req.admin_db.get('Enquiry').insert(req.body,{upsert: true},
			function (err, result) {
              if (err) {
                console.log("Error From Enquiry.js",err);               
              } else {
                res.send('SUCESS')
              }
            });            
    } catch (Ex) {       
        console.log("connection error");
    }
});
module.exports = router;