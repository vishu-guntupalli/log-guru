/**
 * Created by guntupv on 12/24/15.
 */

var mongoClient = require('mongodb').MongoClient;

var mongoDbUrl =  'mongodb://localhost:27017/log-guru';
var collectionName = 'epicenter';

module.exports.doesValueExistInDb = function (parameter) {
    mongoClient.connect(mongoDbUrl, function (err, db) {
        if (!err) {
            var collection = db.collection(collectionName);
            var obj = {};
            obj[parameter] = {$exists: true, $ne: null};
            collection.find(obj, function(data, err){
                if(!err && (data != null)){
                    return true;
                }
                else {
                    return false;
                }
            });
        }
    });
}

module.exports.insertIntoDB = function(parameter) {
    mongoClient.connect(mongoDbUrl, function (err, db) {
        if (!err) {
            var collection = db.collection(collectionName);
            return collection.insert(parameter);
        }
    });
}




