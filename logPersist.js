/**
 * Created by guntupv on 12/18/15.
 */

var fs = require('fs');
var db = require('./dbFunctions');
var mongoClient = require('mongodb').MongoClient;

var mongoDbUrl =  'mongodb://localhost:27017/log-guru';
var logFilePath = '/log4j/epicenter/epicenter.log';

var deconstructedLine = '',
    lineDate = '',
    lineTime = '',
    lineTimeTillSeconds = '',
    lineTimeTillMilliSeconds = '',
    lineLogLevel = '',
    lineLogMessage = '',
    resultObject = '';

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
    var arr0 = [];
    arr0[0] = lineLogMessage;

    var obj1 = {};
    obj1[lineLogLevel] = arr0;

    var arr1 = [];
    arr1[0] = obj1;

    var obj2 = {};
    obj2[lineTimeTillMilliSeconds] = arr1;

    var arr2 = [];
    arr2[0] = obj2;

    var obj3 = {};
    obj3[lineTimeTillSeconds] = arr2;

    var arr3 = [];
    arr3[0] = obj3;

    var obj4 = {};
    obj4[lineDate] = arr3;

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
        var o1= {};
        o1[lineDate] = {$exists: true, $ne: null};

        db.doesValueExistInDb(connection, o1, function (dateExists, result) {

            if (dateExists) {
                resultObject = result;

                var o3 = {};
                o3[lineTimeTillSeconds] = {$exists: true, $ne: null};
                var o2 = {};
                o2['$elemMatch'] = o3;
                var o1 = {};
                o1[lineDate] = o2;

                db.doesValueExistInDb(connection, o1, function (timeTillSecondsExists, result) {
                    if (timeTillSecondsExists) {
                        resultObject = result;

                        var o5 = {};
                        o5[lineTimeTillMilliSeconds] = {$exists: true, $ne: null};
                        var o4 = {};
                        o4['$elemMatch'] = o5;
                        var o3 = {};
                        o3[lineTimeTillSeconds] = o4;
                        var o2 = {};
                        o2['$elemMatch'] = o3;
                        var o1 = {};
                        o1[lineDate] = o2;

                        db.doesValueExistInDb(connection, o1, function (timeTillMsExists, result) {
                            if (timeTillMsExists) {
                                resultObject = result;

                                var o7 = {};
                                o7[lineLogLevel] = {$exists: true, $ne: null};
                                var o6 = {};
                                o6['$elemMatch'] = o7;
                                var o5 = {};
                                o5[lineTimeTillMilliSeconds] = o6;
                                var o4 = {};
                                o4['$elemMatch'] = o5;
                                var o3 = {};
                                o3[lineTimeTillSeconds] = o4;
                                var o2 = {};
                                o2['$elemMatch'] = o3;
                                var o1 = {};
                                o1[lineDate] = o2;

                                db.doesValueExistInDb(connection, o1, function (logLevelExists, result) {
                                    if (logLevelExists) {
                                        resultObject = result;

                                        var o9 = [];
                                        o9[0] = lineLogMessage;
                                        var o8 = {};
                                        o8['$in'] = o9;
                                        var o7 = {};
                                        o7[lineLogLevel] = o8;
                                        var o6 = {};
                                        o6['$elemMatch'] = o7;
                                        var o5 = {};
                                        o5[lineTimeTillMilliSeconds] = o6;
                                        var o4 = {};
                                        o4['$elemMatch'] = o5;
                                        var o3 = {};
                                        o3[lineTimeTillSeconds] = o4;
                                        var o2 = {};
                                        o2['$elemMatch'] = o3;
                                        var o1 = {};
                                        o1[lineDate] = o2;

                                        db.doesValueExistInDb(connection, o1, function (logMessageExists, result) {
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
