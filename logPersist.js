/**
 * Created by guntupv on 12/18/15.
 */

var fs = require('fs');
var db = require('./dbFunctions');

var logFilePath = '/log4j/epicenter/epicenter.log';

var lineReader = require('readline').createInterface({
    input: fs.createReadStream(logFilePath)
});

fs.exists(logFilePath, function(exists) {
    if(exists) {
        console.log('File exists');

        var deconstructedLine, lineDate, lineTime, lineTimeTillSeconds, lineTimeTillMilliSeconds, lineLogLevel, lineLogMessage, longLineLogMessage = '';
        lineReader.on('line', function (line) {

            deconstructedLine = line.split(/\s+/);
            if (Date.parse(deconstructedLine[0])) {

                lineDate = deconstructedLine[0];
                lineTime = deconstructedLine[1].split(",");
                lineTimeTillSeconds = lineTime[0];
                lineTimeTillMilliSeconds = lineTime[1];
                lineLogLevel = deconstructedLine[2];

                if( db.doesValueExistInDb(lineDate), function(exists){

                    console.log(exists)

                    if(db.doesValueExistInDb(lineDate+'.'+lineTimeTillSeconds)) {
                        console.log("Time till seconds Exists")

                        if(db.doesValueExistInDb(lineDate+'.'+lineTimeTillSeconds+'.'+lineTimeTillMilliSeconds)) {
                            console.log("Time till milliseconds exists")

                            if(db.doesValueExistInDb(lineDate+'.'+lineTimeTillSeconds+'.'+lineTimeTillMilliSeconds+'.'+lineLogLevel)) {
                                console.log("Log level exists")

                                if (longLineLogMessage == '') {
                                    lineLogMessage = deconstructedLine.slice(3).join("");
                                }
                                else {
                                    lineLogMessage = longLineLogMessage;
                                    longLineLogMessage = '';
                                }
                                if(db.doesValueExistInDb(lineDate+'.'+lineTimeTillSeconds+'.'+lineTimeTillMilliSeconds+'.'+lineLogLevel+'.'+lineLogMessage)){
                                    console.log('everything already exists')
                                }
                                else {
                                    //db.insertIntoDb(deconstructedLine[0].lineTime[0].lineTime[1].deconstructedLine[2].lineLogMessage)
                                }
                            }
                        }
                    }
                    }) {

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

                    var obj1 = {};
                    obj1[lineLogLevel] = lineLogMessage;

                    var obj2 ={};
                    obj2[lineTimeTillMilliSeconds] = obj1;

                    var obj3 = {};
                    obj3[lineTimeTillSeconds] = obj2;

                    var obj4 = {};
                    obj4[lineDate] = obj3;

                    db.insertIntoDB(obj4);
                }
            }

            else {
                longLineLogMessage = longLineLogMessage.concat(line);
            }
        });
    }
})