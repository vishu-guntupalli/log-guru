/**
 * Created by guntupv on 12/18/15.
 */

var fs = require('fs');
var db = require('./dbFunctions');
var mongoClient = require('mongodb').MongoClient;

var mongoDbUrl =  'mongodb://localhost:27017/log-guru';
var logFilePath = '/log4j/epicenter/epicenter.log';

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

var doJob = function(connection, lr) {
    var deconstructedLine, lineDate, lineTime, lineTimeTillSeconds, lineTimeTillMilliSeconds, lineLogLevel, lineLogMessage, longLineLogMessage = '';
    lr.on('line', function (line) {

        deconstructedLine = line.split(/\s+/);
        if (Date.parse(deconstructedLine[0])) {

            lineDate = deconstructedLine[0];
            lineTime = deconstructedLine[1].split(",");
            lineTimeTillSeconds = lineTime[0];
            lineTimeTillMilliSeconds = lineTime[1];
            lineLogLevel = deconstructedLine[2];

            db.doesValueExistInDb(connection, lineDate, function (dateExists) {

                if (dateExists) {
                    console.log("Date exists")

                    db.doesValueExistInDb(connection, lineDate + '.' + lineTimeTillSeconds, function (timeTillSecondsExists) {
                        if (timeTillSecondsExists) {
                            console.log("Time till seconds Exists")

                            db.doesValueExistInDb(connection, lineDate + '.' + lineTimeTillSeconds + '.' + lineTimeTillMilliSeconds, function (timeTillMsExists) {
                                if (timeTillMsExists) {
                                    console.log("Time till milliseconds exists")

                                    db.doesValueExistInDb(connection, lineDate + '.' + lineTimeTillSeconds + '.' + lineTimeTillMilliSeconds + '.' + lineLogLevel, function (logLevelExists) {
                                        if (logLevelExists) {
                                            console.log("Log level exists")

                                            if (longLineLogMessage == '') {
                                                lineLogMessage = deconstructedLine.slice(3).join("");
                                            }
                                            else {
                                                lineLogMessage = longLineLogMessage;
                                                longLineLogMessage = '';
                                            }
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
                    if (longLineLogMessage == '') {
                        lineLogMessage = deconstructedLine.slice(3).join("");
                    }
                    else {
                        lineLogMessage = longLineLogMessage;
                        longLineLogMessage = '';
                    }
                    console.log('Nothing exists trying into insert');

                    insertIntoDb(connection, lineLogLevel, lineLogMessage, lineTimeTillMilliSeconds, lineTimeTillSeconds, lineDate);
                }
            })
        }

        else {
            longLineLogMessage = longLineLogMessage.concat(line);
        }
    });
}
