/**
 * Created by guntupv on 12/24/15.
 */

var collectionName = 'epicenter';

module.exports.doesValueExistInDb = function (db, parameter, callback, extractLineVariables, deconstructedLine) {
    var collection = db.collection(collectionName);

    collection.findOne(parameter, function(err, data){
        if(!err && (data != null)){
            callback(true, data, extractLineVariables, deconstructedLine);
        }
        else {
            console.log(err)
            callback(false, data, extractLineVariables, deconstructedLine);
        }
    });
}

module.exports.insertIntoDB = function(db, parameter, extractLineVariables, deconstructedLine) {
    var collection = db.collection(collectionName);
    collection.insert(parameter);
    extractLineVariables(deconstructedLine);
}




