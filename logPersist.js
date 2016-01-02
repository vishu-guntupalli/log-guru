/**
 * Created by guntupv on 12/18/15.
 */

var fs = require('fs');
var db = require('./dbFunctions');
var mongoClient = require('mongodb').MongoClient;

var mongoDbUrl =  'mongodb://localhost:27017/log-guru';
var logFilePath = '/log4j/epicenter/epicenter.log';

var deconstructedLine, lineDate, lineTime, lineTimeTillSeconds, lineTimeTillMilliSeconds, lineLogLevel, lineLogMessage = '';

mongoClient.connect(mongoDbUrl, function(err, connection) {

    if(!err) {
        var db = connection;
        var lineReader = require('readline').createInterface({
            input: fs.createReadStream(logFilePath)
        });

        fs.exists(logFilePath, function(exists){
          if(exists){
              console.log('File exists');
              doJob(db, lineReader)
          }
        })
    }
});

function insertIntoDb(connection, lineLogLevel, lineLogMessage, lineTimeTillMilliSeconds, lineTimeTillSeconds, lineDate) {
    var obj1 = {};
    obj1[lineLogLevel] = lineLogMessage;

    var obj2 = {};
    obj2[lineTimeTillMilliSeconds] = obj1;

    var obj3 = {};
    obj3[lineTimeTillSeconds] = obj2;

    var obj4 = {};
    obj4[lineDate] = obj3;

    db.insertIntoDB(connection, obj4);
}

function extractLineVariables() {
    lineDate = deconstructedLine[0];
    lineTime = deconstructedLine[1].split(",");
    lineTimeTillSeconds = lineTime[0];
    lineTimeTillMilliSeconds = lineTime[1];
    lineLogLevel = deconstructedLine[2];
    lineLogMessage = deconstructedLine.slice(3).join("");
}
var doJob = function(connection, lr) {

    function doTheInsertingBusiness() {
        db.doesValueExistInDb(connection, lineDate, function (dateExists) {

            if (dateExists) {

                db.doesValueExistInDb(connection, lineDate + '.' + lineTimeTillSeconds, function (timeTillSecondsExists) {
                    if (timeTillSecondsExists) {

                        db.doesValueExistInDb(connection, lineDate + '.' + lineTimeTillSeconds + '.' + lineTimeTillMilliSeconds, function (timeTillMsExists) {
                            if (timeTillMsExists) {

                                db.doesValueExistInDb(connection, lineDate + '.' + lineTimeTillSeconds + '.' + lineTimeTillMilliSeconds + '.' + lineLogLevel, function (logLevelExists) {
                                    if (logLevelExists) {

                                        db.doesValueExistInDb(connection, lineDate + '.' + lineTimeTillSeconds + '.' + lineTimeTillMilliSeconds + '.' + lineLogLevel + '.' + lineLogMessage, function (logMessageExists) {
                                            if (logMessageExists) {
                                                console.log('everything already exists')
                                            }
                                            else {
                                                insertIntoDb(connection, lineLogLevel, lineLogMessage, lineTimeTillMilliSeconds, lineTimeTillSeconds, lineDate);
                                            }
                                        })
                                    }

                                })
                            }
                        })
                    }
                })
            }

            else {
                console.log('Nothing exists trying into insert ');
                insertIntoDb(connection, lineLogLevel, lineLogMessage, lineTimeTillMilliSeconds, lineTimeTillSeconds, lineDate);
            }
        })
    }

    lr.on('line', function (line) {

        deconstructedLine = line.split(/\s+/);
        if (Date.parse(deconstructedLine[0])) {

            if(lineDate == '') {
                extractLineVariables();
            }
            else {
                doTheInsertingBusiness();
                extractLineVariables();
            }

        }
        else {
            lineLogMessage = lineLogMessage.concat(line);
        }
    });

    lr.on('close', function(){
        doTheInsertingBusiness();
    })
}
