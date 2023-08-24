var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');


const verifyToken1 = (req, res) => {
    // console.log("headersss")
    // console.log(req)
    const TokenPromise = new Promise((resolve, reject) => {
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined') {
            // Split at the space 
            const bearer = bearerHeader.split(' ');
            // Get the token from array
            const bearerToken = bearer[1];
            // Set the token
            resolve(req.token = bearerToken);
    
            // resolve(req.token);
        } else {
            // Forbidden
            reject(res.sendStatus(404));
        }
        })
        return TokenPromise;
    }; 
  

    module.exports = verifyToken1;

//FORMAT FOR TOKEN
// Authorization: Bearer <access_token>
// function verifyToken(req, res, next) {
// 	// Get auth header value
// 	const bearerHeader = req.headers['authorization'];
// 	// Check if bearer is undefined
// 	if (typeof bearerHeader !== 'undefined') {
// 		// Split at the space 
// 		const bearer = bearerHeader.split(' ');
// 		// Get the token from array
// 		const bearerToken = bearer[1];
// 		// Set the token
// 		req.token = bearerToken;

// 		return req.token;
// 	} else {
// 		// Forbidden
// 		return res.sendStatus(404);
//     }
// }