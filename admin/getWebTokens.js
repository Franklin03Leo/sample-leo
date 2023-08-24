var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

// router.post('/', function (req, res, next) {
    // if (!req.body.username || !req.body.password) {
    //     return res.status(404).send('Message : Request body is not found')
    // }
    // const db = req.admin_db;
    // var collection = db.collection('User');
    // var EmailID = req.body.username;
    // const user = {
    //     username: req.body.username,
    //     password: req.body.password
    // }
    // function decrypt(pass) {
    //     console.log(pass)
	// 	var cryptLib = require('cryptlib'),
	// 		iv = 'rv6Isv_BpSFBrB2V'//cryptLib.generateRandomIV(16), //16 bytes = 128 bit 
	// 	key = 'b16920894899c7780b5fc7161560a412'//cryptLib.getHashSha256('my secret key', 32), //32 bytes = 256 bits 
	// 	originalText = cryptLib.decrypt(pass, key, iv);
	// 	return originalText;
    // }
    
    // var query = [
    //     { $match: { 'ContactDetails.EmailID': user.username } },
    //     {
	// 			$project: {
    //                 'email_id': '$ContactDetails.EmailID',
    //                 'user_password': '$PasswordDetails.Password'
    //             }
    //         }]

    // try {
    //     collection.aggregate(query, function(error, docs) {
    //         if (error) {
    //             console.log(error)
    //             return res.sendStatus(500);
    //             // if error occurs internal error will be sent
    //         } if (docs == "") {
    //             return res.status(200).send('Message : Username is not present in DB');
    //             // username is not exist 
    //         } else {
    //             var doc = docs[0];
    //             var decrypt_password = decrypt(doc.user_password);
    //             if (decrypt_password != user.password) {
    //                return res.status(200).send('Message : Invalid Password');
    //             }
    //             // Generating webtokens if username and password is valid
    //             jwt.sign({ user }, 'secretkey', { expiresIn: '120s' }, (err, token) => {
    //                 res.json({
    //                     token
    //                 });
    //             });
    //         }
    //     });
    // }
    // catch (ex) { 
    //     console.dir(ex);
    // }

    const webtokenGeneration = (user, exp) => {
        console.log(user)
        const webTokenPromise = new Promise((resolve, reject) => {
            jwt.sign({ user }, 'secretkey', { expiresIn: exp }, (error, token) => {
            error ? reject(error) : resolve(token)
            console.log(token)
            })
        }); 
        return webTokenPromise;
    }
       // jwt.sign({ user }, 'secretkey', { expiresIn: '120s' }, (err, token) => {
                        //     res.json({
                        //         token
                        //     });
                        // });
       // return token;
   // });
        
  
// });
module.exports = webtokenGeneration;