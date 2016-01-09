/**
 * Created by guntupv on 12/24/15.
 */

var collectionName = 'epicenter';

module.exports.doesValueExistInDb = function (db, parameter, callback, extractLineVariables) {
    var collection = db.collection(collectionName);

    collection.findOne(parameter, function(err, data){
        if(!err && (data != null)){
            callback(true, data, extractLineVariables);
        }
        else {
            console.log(err)
            callback(false, data, extractLineVariables);
        }
    });
}

module.exports.insertIntoDB = function(db, parameter, extractLineVariables) {
    var collection = db.collection(collectionName);
    collection.insert(parameter);
    extractLineVariables();
}




