/* Get the user details for updating in Single user update */
var express = require('express');
const logger = require('./logger'); //adding loggers
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
var singleUpdateRouter = express.Router();
singleUpdateRouter.get('/',verifyToken, function (req, res, next) {
    try {
        //DB Connection
        var strBody = req.query;
        var email_id = req.query.username;
        var db = req.admin_db;
        var collection = db.collection('User');
collection.find({"ContactDetails.EmailID": email_id,"ApprovalDetails.Status": "Approved" },function (err, docs1) {
    if(err){
        logger.log("error",`${err}`);

    }
    else{
        docs1.forEach(function(subdocs)
{
    if(subdocs.UserType=="Borrower" ||subdocs.UserType=="Lender" )
    {
// console.log("erejjfiodjfdjjjsddsfdf"+subdocs.UserID)
collection.aggregate([{ $match: { "ContactDetails.EmailID": subdocs.ContactDetails.EmailID, "ApprovalDetails.Status": "Approved" } },
{
    "$project":
    {
        "FirstName": subdocs.FirstName,
        "LastName": subdocs.LastName,
       "CompanyName": "$_id.CompanyName",
        "EmailId": subdocs.ContactDetails.EmailID,
        "MobileNo": "$ContactDetails.MobileNo",
        "Country": subdocs.Address.Country,
        "City": subdocs.Address.City,
         "State": subdocs.Address.State,
        "UserType": subdocs.UserType,
        "UserRole":subdocs.UserRole,
         "Area": subdocs.Address.AddArea,
         "Pincode": "$Address.Pincode",
         "Addressline1":subdocs.Address.AddressLine1,
         "Addressline2":subdocs.Address.AddressLine2,
         "LandMark":subdocs.Address.Landmark,
         "UserStatus": subdocs.UserStatus
    }

}], function (err, docs) {
    if(err)
    {

        logger.log("error",`${err}`);
    }
    else{
   //   console.log("dmfsdnfkdnfkdnfnkdnlkfnsdl3333333333"+JSON.stringify(docs))
        res.send(docs)
        var logobj={};//object initialization
        logobj.UserID= "dummyuserName@analyticBrains.com";//adding userid to object
        logobj.Data = docs;//adding data to object
        logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
        // logger info ends here - added by SRINIVASAN            
        res.end();
    }
})

    }
   else if(subdocs.UserType=="Appraiser"||subdocs.UserType=="Admin")
 // else
  {
  
        // Query to fetch the user details based on the username(emailid)
        collection.aggregate([{ $match: { "ContactDetails.EmailID": email_id, "ApprovalDetails.Status": "Approved" } },
        {
            "$lookup":
                {
                    from: "Contracts",
                    localField: "Contract.ContractReference",
                    foreignField: "contract_reference",
                    as: "docs"
                },
        },
        {
            "$unwind": "$docs"
        },
        {
            "$group": {
                _id: {
                    "FirstName": "$FirstName",
                    "LastName": "$LastName",
                    "CompanyName": "$CompanyName",
                    "EmailId": "$ContactDetails.EmailID",
                    "MobileNo": "$ContactDetails.MobileNo",
                    "Country": "$Address.Country",
                    "City":"$Address.City",
                    "State":"$Address.State",
                    "Address1":"$Address.AddressLine1",
                    "Address2":"$Address.AddressLine2",
                    "Landmark":"$Address.Landmark",
                    "Area": "$Address.AddArea",
                    "Pincode": "$Address.Pincode",
                    "ContractRef": "$Contract.ContractReference",
                    "UserType": "$UserType",
                    "UserRole":"$UserRole",
                    "GeneralAlert": "$general_alert_flag",
                    "StartDate": "$Contract.StartDate" ,
                    "EndDate": "$Contract.EndDate" ,
                    "ContractStDate":  "$docs.valid_start_date",
                    "ContractEndDate":  "$docs.valid_to_date",
                    // "Exportflag": "$docs.export_flag",
                    "UserStatus": "$UserStatus",
                    "associationName" : "$AssociationDetails"
                }
            }
        },
        {
            "$project":
                {
                    "FirstName": "$_id.FirstName",
                    "LastName": "$_id.LastName",
                    "CompanyName": "$_id.CompanyName",
                    "EmailId": "$_id.EmailId",
                    "MobileNo": "$_id.MobileNo",
                    "Country": "$_id.Country",
                    "City": "$_id.City",
                    "State": "$_id.State",
                    "UserType": "$_id.UserType",
                    "UserRole":"$_id.UserRole",
                    "Area": "$_id.Area",
                    "Pincode": "$_id.Pincode",
                    "ContractRef": "$_id.ContractRef",
                    "Addressline1":"$_id.Address1",
                    "Addressline2":"$_id.Address2",
                    "LandMark": "$_id.Landmark",
                    "GeneralAlert": "$_id.GeneralAlert",
                    "StartDate": "$_id.StartDate",
                    "EndDate": "$_id.EndDate",
                    "UserStatus": "$_id.UserStatus",
                    "ContractStDate":  "$_id.ContractStDate",
                    "ContractEndDate":"$_id.ContractEndDate",
                    "AssociationName":"$_id.associationName",
                    "_id":0
                }
        }], function (err, docs) {
            if(err)
            {
                //logger error - added by SRINIVASAN
                logger.log("error",`${err}`);
            }
            else{
                //console.log(JSON.stringify(docs))
                res.send(docs)
                // logger info starts here - added by SRINIVASAN
                var logobj={};//object initialization
                logobj.UserID= "dummyusername@analyticbrains.com";//adding userid to object
                logobj.Data = docs;//adding data to object
                logger.log('info',`${JSON.stringify(logobj)}`);//object parse into logger
                // logger info ends here - added by SRINIVASAN            
                res.end();
            }
        })
             
    }
})
    }

})
    }
    catch (ex) {
        //logger error - added by SRINIVASAN
        logger.log("error",`${ex}`);
     }
});
module.exports = singleUpdateRouter;

