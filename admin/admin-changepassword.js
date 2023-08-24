/* To check the new and current password is same or not */
const http = require("http");
const express = require('express');
const router = express.Router();
const cryptLib = require('cryptlib');
router.post('/', function (req, res, next) {
    const strBody = req.body;
    const email_id = strBody.username;
    const passWrd = strBody.old_password;
    const db = req.admin_db;
    const collection = db.collection('user');
    // Method to decrypt the password
    function decrypt(pass) {
        const iv = 'rv6Isv_BpSFBrB2V';//cryptLib.generateRandomIV(16), //16 bytes = 128 bit 
        const key = 'b16920894899c7780b5fc7161560a412';//cryptLib.getHashSha256('my secret key', 32), //32 bytes = 256 bits 
        const originalText = cryptLib.decrypt(pass, key, iv);
        return originalText;
    }
    // Query to get the password for the given username 
    try {
        collection.aggregate([{ $match: { 'contact_details.email_id': email_id } },
        {
            $project: {

                "User Name": "$contact_details.email_id",
                "password": "$password_details.password"
            }
        }
        ]).then((docs) => {
            if (docs[0].length === 0) {
                const obj = {
                    status: 'notexist'
                };
                const arr = JSON.stringify(obj);
                res.send(arr);
            }
            else {
                docs.forEach((doc) => {
                    const decrypt_password = decrypt(doc.password);
                    if (decrypt_password == passWrd) {
                        try {
                            const obj = {
                                status: 'valid'
                            };
                            const arr = JSON.stringify(obj);
                            res.send(arr);
                        }
                        catch (ex) {
                            console.log(ex);
                            const obj = {
                                status: 'dataerror'
                            };
                            const arr = JSON.stringify(obj);
                            res.send(arr);
                        }
                    }
                    else {
                        const obj = {
                            status: 'invalid'
                        };
                        const arr = JSON.stringify(obj);
                        res.send(arr);
                    }
                });
            }
        }).catch((err) => {
            console.log("Error in retriving values from DB " + err);
        })
    }
    catch (ex) {
        console.dir(ex);
    }
});
module.exports = router;