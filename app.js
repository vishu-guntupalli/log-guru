
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

app.get('/', function(req, res){
    res.sendfile('index.html');
});

io.on('connection', function(socket){
    var originalData = null;
    console.log('a user connected');
    follower.on('line', function(filename, line) {
        io.emit('message', line);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
