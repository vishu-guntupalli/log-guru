/**
 * Created by guntupv on 12/24/15.
 */

var collectionName = 'epicenter';

module.exports.doesValueExistInDb = function (db, parameter, callback) {
    var collection = db.collection(collectionName);
    var obj = {};
    obj[parameter] = {$exists: true, $ne: null};
    collection.findOne(obj, function(err, data){
        if(!err && (data != null)){
            callback(true);
        }
        else {
            callback(false);
        }
        db.close();
    });
}

module.exports.insertIntoDB = function(db, parameter) {
    var collection = db.collection(collectionName);
    collection.insert(parameter, function(data){
        db.close();
    });
}




