/* Fetch the user details for Bulk Update, based on the selected companyname */
var express = require('express');
var singleUpdateRouter = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
singleUpdateRouter.get('/',verifyToken, function (req, res, next) {
    var strBody = req.query.selectedcomp;
    var jsonObj = strBody;
    var companyy = JSON.stringify(strBody);
    //DB Connection
    var db = req.admin_db;
    var collection = db.collection('user');
    try {
        //DB Query
        collection.aggregate(
            [{ $match: { "company_institute": strBody.trim(), "approval_details.status": "Approved" } },
            {
                "$lookup":
                    {
                        from: "contracts",
                        localField: "contract.contract_reference",
                        foreignField: "contract_reference",
                        as: "docs"
                    }
            },
            {
                "$unwind": "$docs"
            },
            {
                "$group": {
                    _id: {
                        "FirstName": "$first_name",
                        "LastName": "$last_name",
                        "CompanyName": "$company_institute",
                        "EmailId": "$contact_details.email_id",
                        "PhoneNum": "$contact_details.phone_number",
                        "Department": "$department",
                        "AreaOfInterest": "$area_of_interest",
                        "ContractRef": "$contract.contract_reference",
                        "Usertype": "$rolename",
                        "DownloadLimit": "$docs.download_limit",
                        "GeneralAlert": "$general_alert_flag",
                        "StartDate": "$contract.start_date",
                        "EndDate": "$contract.end_date",
                        "ContractStDate": "$docs.valid_start_date",
                        "ContractEndDate": "$docs.valid_to_date",
                        "Exportflag": "$docs.export_flag",
                        "userStatus": "$user_status"
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
                        "PhoneNum": "$_id.PhoneNum",
                        "Department": "$_id.Department",
                        "AreaOfInterest": "$_id.AreaOfInterest",
                        "ContractRef": "$_id.ContractRef",
                        "Usertype": "$_id.Usertype",
                        "DownloadLimit": "$_id.DownloadLimit",
                        "GeneralAlert": "$_id.GeneralAlert",
                        "StartDate": "$_id.StartDate",
                        "EndDate": "$_id.EndDate",
                        "ContractStDate": "$_id.ContractStDate",
                        "ContractEndDate": "$_id.ContractEndDate",
                        "Exportflag": "$_id.Exportflag",
                        "UserStatus": "$_id.userStatus"
                    }
            }], function (err, docs) {
                res.send(docs)
                res.end();
            })
    }
    catch (ex) { }
});

module.exports = singleUpdateRouter;

