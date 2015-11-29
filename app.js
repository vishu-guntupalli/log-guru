
/**
 * Module dependencies
 */

var app = require('express')();
var express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var follow = require('text-file-follower');
var __logFile= '/log4j/epi-test-webapp.log';
var follower = follow(__logFile);

app.use('/swag/socket.io', express.static(__dirname + '/node_modules/socket.io-client'))
/**
 * Configuration
 */

fs.watch('/log4j/epi-test-webapp.log.1', function(path, stats){
   console.log('file name changed');
   follower = null;
    follower = follow(__logFile);
    watchForLineChange();
});

app.get('/', function(req, res){
    res.sendfile('index.html');
});

io.on('connection', function(socket){
    var originalData = null;
    console.log('a user connected');
    watchForLineChange();
});

var watchForLineChange = function () {
    follower.on('line', function(filename, line) {
        io.emit('message', line);
    });
}

http.listen(3000, function(){
    console.log('listening on *:3000');
});
