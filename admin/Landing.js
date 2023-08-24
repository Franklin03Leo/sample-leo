var express = require('express');
var router = express.Router();
//Db connection and parameters
router.post('/', function (req, res, next) {
	var db = req.db;
	var Therapeutic;
	var Diseases;
	var Biomarkers;

	try {
		var landing_common = ExecuteQuery(db, 'landing_common');//method to get counts
		var landing_slide = ExecuteQuery(db, 'landing_slide');//method for slides in landing page

		Promise.all([landing_common, landing_slide]).then(function (values) {
			res.send(values);
			res.end();
		}, function (err) {
			res.send([]);
			res.end();
		});
	}
	catch (ex) {
	}
});

function ExecuteQuery(db, query) {
	return new Promise((resolve, reject) => {
		// DB connection for getting counts for respective fields in landing page
		if (query == "landing_common") {
			var LandingObject = {};
			db.collection('lp_stats').distinct('therapeutic_class', { 'therapeutic_class': { $ne: null } }, function (err, items) {
				LandingObject["Therapeutic_count"] = items.length;
				db.collection('disease_master').distinct('disease_name', { 'disease_name': { $ne: null } }, function (err1, items1) {
					LandingObject["Disease_count"] = items1.length;
					db.collection('ebm_master').distinct('ebm_id', { 'ebm_id': { $ne: null } }, function (err2, items2) {
						LandingObject["biomarker_count"] = items2.length;
						resolve(LandingObject);
					})
				})
			})
			// DB connection for landing page slides 
		} else if (query == "landing_slide") {
			db.collection('lp_stats').find({}, function (err, doc) {
				if (err) {
					resolve([]);
				}
				else if (doc.length) {
					resolve(doc);
				}
				else {
					resolve([]);
				}
			});
		}
	})
}

module.exports = router;