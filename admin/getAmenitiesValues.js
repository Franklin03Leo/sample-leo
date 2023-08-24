// Import necessary modules and dependencies .. by Franklin.

//imports the Express.js module, which is used to create an Express application.
let express = require('express');
//creates a new router object using the Router() method from the Express module
let router = express.Router();
// imports a logger module, which is likely used for logging purposes
const logger = require('./logger');
//used for verifying JSON Web Tokens (JWTs) for authentication or authorization purposes.
let verifyToken=require('../commonjs/Verify_JWT');


// Define the route and handle the GET request
router.get('/',verifyToken, (req, res) => {
    // get the Admin DB from the request
    let db = req.admin_db;
    // collection() method is called on the db object to access a specific collection
    let collection = db.collection('Param_New');
    try {
       // Perform the MongoDB aggregation
        collection.aggregate([
            {
              "$match": { //filters the documents by selecting only those with a "field" value of "Amenities".
                "field": "Amenities",
              }
            },
            {
              "$project": { // project method only project "Interior", "Exterior".
                "values.Interior": 1,
                "values.Exterior": 1
              }
            }
          ], function (err, docs) { //The provided callback function is executed after the aggregation is completed
            if (err) {
               // Log any errors while getting the data
                console.log(err);
            }
            else {
              // send the responce to the forntEnd
                res.send(docs);
            }
        })
    } catch (err) {
      // Log any errors that occur
        logger.log("getAmenities values error", `${err}`);
    }
});

// Export the router
module.exports = router;
