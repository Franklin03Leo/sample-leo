
var http = require("http");
var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  const db = req.admin_db;
  const collection =db.collection('User');
  collection.find({"RandomString":req.query.randomcode}, function(err,docs){
      if(err){
          console.log(err);
      }
      else{
          res.send(docs)
      }
  })

});

module.exports = router;
