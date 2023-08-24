
    function dailyMail(){
try{
    var express = require('express');
    var router = express.Router();
    var fs = require("fs")
    var verifyToken=require('../commonjs/Verify_JWT');//  To Verify Token
    var cron = require('node-cron');
    require('dotenv').config()
    var XLSX = require('xlsx');
    var monk = require('monk');
    var mailService2 = require("../commonjs/admin-mail");
 // cron.schedule(process.env.DAILY_EMAIL_TIMING, () => {
 
 //var db = req.admin_db;

var db = monk('localhost:27017/Valurite_Unittest');
  var collection = db.collection('User');
        // Method to convert duration in HH:MM:SS format
        function msToTime(duration) {
          var milliseconds = parseInt((duration % 1000) / 100),
              seconds = parseInt((duration / 1000) % 60),
              minutes = parseInt((duration / (1000 * 60)) % 60),
              hours = parseInt((duration / (1000 * 60 * 60)) % 24);
          hours = (hours < 10) ? "0" + hours : hours;
          minutes = (minutes < 10) ? "0" + minutes : minutes;
          seconds = (seconds < 10) ? "0" + seconds : seconds;
          return hours + ":" + minutes + ":" + seconds;
      }
   
      collection.aggregate([{ $match: { 'ApprovalDetails.Status': 'Approved' } },
      {
           $lookup:
               {
                   from: "Userlogs",
                   localField: "ContactDetails.EmailID",
                   foreignField: "email_id",
                    as: "docs"
                }
      },
        {
            $unwind: "$docs"
        },
        {
            $project: {
                _id: 0,
             CompanyName: 1,
                "docs": 1
           }
        },
        {
            $group: {
                "_id": {
                    company_name: "$CompanyName",
                    user_name: "$docs.email_id",
                   login_time: "$docs.login_time",
            //          {
            //      $cond:
            //         [
            //            {
            //             // $gte: ["$docs.login_time", new Date(new Date().setHours(00, 00, 00))] } ,
            //              $gt:["$docs.login_time",new Date(new Date(Date.now() - 172800000).setHours(0,0,0,0))]},  //added for VRR-742 0n Aug 2nd
            //              '$docs.login_time',
            //             null
            //          ]
            //  },
                  
                 active_session_time: 
                   {
               $cond:
                  [
                     {
                       $gt:["$docs.active_session_time",new Date(new Date(Date.now() - 86400000).setHours(0,0,0,0))]},
                       '$docs.active_session_time',
                     null
                   ]
           }, 
                    logout_time: "$docs.logout_time"
                },
                "count": { "$sum": 1 }
            }
        },
        {
            $project: {
                _id: 0,
                "companyname": "$_id.company_name",
                "username": "$_id.user_name",
                "Login":"$_id.login_time",
                "Logout": "$_id.logout_time",
                "LastUpdatedsession":"$_id.active_session_time"//added for VRR-742 on Aug 2nd 2023
            }
        },
        {
            $sort: { "companyname": 1, "username": 1 }
        }
       ]).then((docs) => {
        const result2 = [...docs.filter(res => res.Login !== null && res.LastUpdatedsession !==null)];
        const result=result2.sort(function(a, b) {   //VRR-490 issue fix
            return a.companyname.toLowerCase().localeCompare(b.companyname.toLowerCase());
          });
      console.log("result"+JSON.stringify(result))
        // docs.find({ "Login": { $ne: null } })
        // .then((result)=>{
            for (let obj of result) {
                if (obj.Logout === void (0))//void(0) to check null or undefined
                {
                  //  obj.duration = 'NA';  //added for VRR-742 on Aug 2nd 2023
                  if(obj.LastUpdatedsession=== void (0) || obj.LastUpdatedsession>=new Date(new Date().getTime() - 31 * 1000) )
                  obj.Logout='NA'
                  else
                  {
                    obj.Logout = obj.LastUpdatedsession;
                  }
                    
                } 
                if(obj.Logout!=void (0) &&  obj.Logout!='NA')
                {
                    obj.duration = msToTime(obj.Logout - obj.Login);
                }
                else{
                    obj.duration = 'NA' 
                }
            }
           //console.log("   result"+JSON.stringify(result))
     const  result1 = [...result.filter(res => 
                res.Logout=='NA'|| new Date(res.Logout)>=new Date(new Date().setHours(00, 00, 00)))] //Jira issue VRR-742        
            const firstSheet1= result1.map((obj) => {
                obj_ = {};
                obj_['Company Name'] = obj['companyname'];
                obj_['User Name'] = obj['username'];
                obj_['Total Duration'] = obj['duration'];
             //   obj_['LogoutTime'] = obj['Logout'];
              //  obj_['Logged-in Time'] = this.datePipe.transform(obj['login'], 'dd-MM-yyyy hh:mm:ss a')
                return obj_;
              });
            //  console.log("firstSheet1"+JSON.stringify(firstSheet1))
              groupBy = function(xs, key) {
                 return xs.reduce(function(rv, x) {
                 (rv[x[key]] = rv[x[key]] || []).push(x);
                 return rv;
                 }, {});
                };
                  
                addTime=(sTime,eTime)=>{
                    if(sTime==undefined||sTime=='NA')
                    sTime='00:00:00'
                    if(eTime==undefined||eTime=='NA')
                    eTime='00:00:00'
                var a = sTime.split(":");
                var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
                var b = eTime.split(":");
                var seconds2 = (+b[0]) * 60 * 60 + (+b[1]) * 60 + (+b[2]);
                var date = new Date(1970,0,1);
              date.setSeconds(seconds + seconds2);
                return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
                }
           const firstSheet=     Object.values(groupBy(firstSheet1,'User Name')).map((arrObj)=>{
                 return arrObj.reduce((obj,d)=>{
                  return {'Company Name':obj['Company Name'],'User Name':obj['User Name'],'Total Duration':addTime(obj['Total Duration'],d['Total Duration']).toString()}
                   })
                })

        //     console.log("Result"+JSON.stringify(firstSheet))
const secondSheet= result1.map((obj) => {
    obj_ = {};

    obj_['Company Name'] = obj['companyname'];
    obj_['User Name'] = obj['username'];
    obj_['Login Time'] = new Date(obj['Login']).toLocaleString();
    obj_['Login Time'] = obj_['Login Time'].split("/").join("-");
    if(obj['Logout']=='NA')
        obj_['Logout Time'] ='NA'
    else
    {
        obj_['Logout Time'] = new Date(obj['Logout']).toLocaleString();
        obj_['Logout Time'] =obj_['Logout Time'].split("/").join("-");
    }
    //  obj_['Logged-in Time'] = this.datePipe.transform(obj['login'], 'dd-MM-yyyy hh:mm:ss a')
    return obj_;
  });
//   console.log("secondSheet"+JSON.stringify(secondSheet))
      //  })
        //console.log("ytufuu"+JSON.stringify(docs))
   
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(firstSheet);
      const worksheet2 = XLSX.utils.json_to_sheet(secondSheet);
      var todayDate = new Date()
      var  month = todayDate.getMonth() + 1;
      var date_ = (todayDate.getDate() < 10 ? "0" : "") +todayDate.getDate() + '-' +(month < 10 ? "0" : "") +month +"-" +todayDate.getFullYear()
      var time_ = new Date().toLocaleTimeString();
      var time = time_.replace(/\:/g,'.')
      time_ = time
const fileName = 'Details of ValuRite Userlogs_' + date_ + '_' + time_ + '.xlsx';
XLSX.utils.book_append_sheet(workbook, worksheet, "Summary_of_User_log_Details");
XLSX.utils.book_append_sheet(workbook, worksheet2, "User_log_Details");

      XLSX.writeFile(workbook,process.env.PDFPATH+ fileName);
      copyTo='saranya.tamilselvam@analyticbrains.com'
       attachments = [{
       filename: fileName,
      //   //path: 'http://localhost/Data/'+MailContents.Attachments+'.pdf'// stream this file
         path: process.env.PDFPATH+ fileName
       }];
      content =	"Dear All,<br/><br/>Please find the attached Consolidated excel sheet, showing the daily summary of ValuRite users log. "+  "<br/><br/>Thanking you.<br/><br/>"+"<br/><br/>*** This is an automatically generated email, please do not reply ***";
      setTimeout(()=>{
   
         mailService2(process.env.DAILY_EMAIL, "Details of ValuRite Userlogs", content, copyTo,attachments);
             
              },3000)
    //  
    // }); 
        console.log('running a task every day');
        return true;
  //    });
//})
})

.catch((exe) => {
  console.log("exe"+exe)
});

//})
}
catch(ex)
{
    console.log("error"+ex)
}
}
//})
module.exports = dailyMail;