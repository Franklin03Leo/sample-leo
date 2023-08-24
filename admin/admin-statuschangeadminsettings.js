var http = require("http");
var express = require('express');
var router = express.Router();
var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
const { stringify } = require("querystring");
router.post('/',verifyToken, function(req, res, next) {
    try {
        var strBody = req.body;
        console.log("Received posted data: " + strBody);
        //Getting Param details.. 
        var jsonObj = strBody;
        var field = jsonObj.field;
        var state = jsonObj.state;
        var statuschange = jsonObj.statuschange;
       // var statuschange = 'Active';
        var hirenum = jsonObj.hirenum;      
        var db = req.admin_db;        
        var collection = db.get('Param_New');
         if (field.includes('_')) {
             var splitfield = field.split('_');
             if (splitfield[0] == 'Amenities' && hirenum =='hierachy1') { 
                                collection.find({
                    "field": splitfield[0]
                }, function (err, amenitiesdocs) {
                    if (err) { res.send('3'); }
                                    if (amenitiesdocs) {  
                                    collection.update({ "field": splitfield[0] }, { $set: { 'status': statuschange } });

                        for (var y = 0; y < Object.keys(amenitiesdocs[0].values).length; y++) { 
                            var amenitiessize = Object.keys(amenitiesdocs[0].values);
                            var keystringvalues = '';
                            keystringvalues = 'values.' + amenitiessize[y] + '.' + 'status'; 
                            collection.update({"field": splitfield[0] },
                                { $set: { [keystringvalues]: statuschange } });
                            if (amenitiessize[y] == 'Interior' || amenitiessize[y] == 'Exterior') { 
                                var keystringvalues = '';
                                keystringvalues = 'values.' + amenitiessize[y] + '.' + 'status'; 
                                collection.update({"field": splitfield[0] },
                                    { $set: { [keystringvalues]: statuschange } }); 
                                    var hirekeyyintext = Object.keys(amenitiesdocs[0].values[amenitiessize[y]]);                                    
                                for (var pa = 0; pa < hirekeyyintext.length; pa++) {
                                    if (hirekeyyintext[pa] != 'status') {
                                        var keystringvalues2 = '';                             
                                        keystringvalues2 = 'values.' + amenitiessize[y] + '.' + hirekeyyintext[pa] + '.status'                                        
                                        collection.update({ "field": splitfield[0] },
                                            { $set: { [keystringvalues2]: statuschange } });
                                    }
                                 }
                            }
                            else {
                            var hirekeyy = Object.keys(amenitiesdocs[0].values[amenitiessize[y]]);
                           
                                for (var p = 0; p < hirekeyy.length; p++) {
                                    var finalkey = Object.keys(amenitiesdocs[0].values[amenitiessize[y]][hirekeyy[p]]);
                                    for (var n = 0; n < finalkey.length; n++) {                                        
                                        if (hirekeyy[p] != 'status' && finalkey[n] != 'status') {
                                            var keystringvalues2 = '';
                                            keystringvalues2 = 'values.' + amenitiessize[y] + '.' + hirekeyy[p] + '.' + finalkey[n] + '.status'
                                            collection.update({ "field": splitfield[0] },
                                                { $set: { [keystringvalues2]: statuschange } });

                                        }
                                    }
                                }
                            }
                           
                            
                            
                            
                                        }
                                        
                        res.send('1');
                    }
                  });
               
             }
             else if (splitfield[0] == 'Amenities' && hirenum == 'hierachy2') {
                 collection.find({
                     "field": splitfield[0]
                 }, function (err, amenitiesdocs2) {
                     var keyy = amenitiesdocs2[0].values[splitfield[1]];                     
                     var keykeyy = '';
                     var keykeyy = 'values.' +[splitfield[1]] + '.' + 'status';
                    collection.update({"field": splitfield[0] },
                        { $set: { [keykeyy]: statuschange } });
                     for (let keyy1 in keyy) {                         
                             if (keyy1 == 'status') {
                                var keyy2 = '';
                                 keyy2 = 'values.' +[splitfield[1]] + '.' + keyy1;                                
                                collection.update({"field": splitfield[0] },
                            { $set: { [keyy2]: statuschange } });
                              }
                             else if (keyy1 != 'status') {                                  
                                 for (let key3 in amenitiesdocs2[0].values[splitfield[1]][keyy1]) {
                                     var keyy3 = '';
                                     keyy3 = 'values.' + splitfield[1] + '.' + [keyy1] + '.' + key3;
                                    if (key3 == 'status') {
                                         collection.update({ "field": splitfield[0] },
                                             { $set: { [keyy3]: statuschange } });
                                     }
                                 
                                }
                               for (let key3 in amenitiesdocs2[0].values[splitfield[1]][keyy1]) {
                                   var keyy3 = '';
                                   keyy3 = 'values.' + [splitfield[1]]+'.'+[keyy1]+'.'+key3+ '.status'
                                   if (key3 != 'status') {
                                            collection.update({"field": splitfield[0] },
                                        { $set: { [keyy3]: statuschange } });
                                   }
                         }
                            }
                         }
                 });
                 res.send('1');

             }
             else if (splitfield[0] == 'Amenities' && hirenum == 'hierachy3') {                
                collection.find({
                    "field": splitfield[0]
                }, function (err, amenitiesdocs3) {
                    var keyy2 = amenitiesdocs3[0].values[splitfield[1]][splitfield[2]];
                              
                    for (let keynew2 in keyy2) {  
                        if (keynew2 != 'status') {                                  
                             for (let key3 in amenitiesdocs3[0].values[splitfield[1]][splitfield[2]][keynew2]) {
                                    var keyy3 = '';
                                 keyy3 = 'values.' + splitfield[1] + '.' + splitfield[2] + '.' + keynew2 + '.' + key3;
                               if(key3 == 'status')
                                     
                               {                                 
                                   var keyy3 = '';
                                   keyy3 = 'values.' + splitfield[1] + '.' + splitfield[2] + '.' + key3; 
                                     collection.update({"field": splitfield[0] },
                                     { $set: { [keyy3]: statuschange } });
                                 }
                             }
                        }
                    }
                            })
                            res.send('1');

                 
             }
         }
        
        else {
            collection.find({
                "field": field
            }, function (err, docs) {
           
                if (err) { res.send('3'); }
                if (docs) {
                    collection.update({ "field": field }, { $set: { status: statuschange } });
                    if (Object.keys(docs[0].values).length != 0) {
                        for (var x = 0; x < Object.keys(docs[0].values).length; x++) {
                            var size = Object.keys(docs[0].values);
                            var keystringvalues = '';
                            keystringvalues = 'values.' + size[x] + '.' + 'status';
                            collection.update(
                                {
                                    "field": field
                                },
                                {
                                    $set: {
                                        [keystringvalues]: statuschange
                                    }
                                }
                            );
                        }
                        res.send('1');
                    }
               
                }
                else { res.send('2'); console.log("No Records Found") }
                
            });
        }
        
    } catch (ex) {
       // logger.log('error',`${ex}`);   //adding error logs
        console.dir(ex);
    }
});
module.exports = router;