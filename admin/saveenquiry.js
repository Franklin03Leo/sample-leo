/*This js used for to save the contact us and Pricing details from webs*/
// console.log("cLL");
var http = require("http");
var express = require('express');
var router = express.Router();

router.post('/' , function(req, res, next) {
  try { 
    var jsonObj = req.body;
    var db = req.admin_db;
    var collection = db.collection("Enquiry");
    var i = 0;
  
    insertRow(collection, jsonObj, res, i);
    function insertRow(collection, jsonObj, res, i) {   
      var name = jsonObj[i].Name;
      var email = jsonObj[i].Email;
      var contactNumbers = jsonObj[i].ContactNumbers;
      var message = jsonObj[i].Message;
      var form = jsonObj[i].Form;
      var feedback = jsonObj[i].Feedback;
      var lastUpDate = jsonObj[i].LastUpDate;
      var last_updated_by = jsonObj[i].last_updated_by;
      collection.update(
        { 'Name': name, 'Email': email, "Form": form },
        {
          $set: {
            Feedback: feedback,
            LastUpDate: lastUpDate,
            last_updated_by: last_updated_by
          },
        },  
        function (err, result) {
          if (err) {
            console.log(err);
            logger.log("error", `${err}`);
          } else {            
          }
  
          if (i < jsonObj.length - 1) {
            insertRow(collection, jsonObj, res, ++i);
          } else {
            res.send("1");
          }
        }
      );
     }
    } catch (Ex) {       
        console.log("connection error");
    }
});
module.exports = router;