var express = require('express');
var router = express.Router();
const logger = require('./logger');
router.get('/',  function (req, res, next) {

    var db = req.admin_db;
    // getting purpose details from purpose collection
		var collection = db.collection('Purpose');
        try{
        collection.find({}, function (err, docs) {
            if(err){
                console.log(err);
                logger.log("error",`${err}`);
            }
            else{
                res.send(docs);
                logger.log("info",`${docs}`);
            }
			
		})
    }catch(err){
        console.log(err);
        logger.log("error",`${err}`);
    }
});
module.exports = router;
