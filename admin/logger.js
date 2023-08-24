const {createLogger, transports,format} = require('winston');
require('winston-mongodb')
//let url = 'mongodb://localhost:27017/ValuRite_Staging'

var config = require('../appconfig/config.json');
var url = config.admin_db;

const logger = createLogger({
    transports:[
        new transports.Console({
            level:'info',
            format: format.combine(format.timestamp(),format.json())

        }),
        new transports.File({
            filename:'loginf.log',
            level:'info',
            //format: format.combine(format.timestamp(),format.simple())
            format: format.combine(format.timestamp(),format.json())

        }),
       new transports.MongoDB({
        level:'info',
          options:{ useUnifiedTopology: true },
        db:url
    })
    ]
})
module.exports = logger;