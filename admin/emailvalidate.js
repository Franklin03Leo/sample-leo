var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
router.post('/', function (req, res, next) {
    console.log(req);
    var db = req.admin_db;
    var collection = db.collection('User');
    email=req.body.email;
    console.log("EmailID---"+JSON.stringify(email))
})

module.exports = router;