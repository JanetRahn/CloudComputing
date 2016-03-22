var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var fs = require('fs');

var clients = {};

app.use(express.static(__dirname + '/public'));
                                                                           
app.post('/joinChat', function(req, res) {
	res.sendFile(__dirname + '/public/chat.html');
});

http.listen(8888, function() {
	console.log("-----------------------------------------------------");
	console.log("-------- Server URL: http://127.0.0.1:8888/ ---------");
	console.log("-----------------------------------------------------");
	console.log("");
});

io.sockets.on('connection', function(socket) {

	socket.on('infoUser', function(username){
		socket.emit('servermessage', 'Welcome to the Chat, ' + username);
		console.log('infoUser: ' + username);
		clients[socket.id] = username; 
		console.log('Socket id: ' + socket.id);
	});
	
	socket.on('chatmessage', function(message){
		console.log('Socket id: ' + socket.id + '  Name: ' + clients[socket.id] + '   message: ' + message );
		io.emit('message_to_client', {message: message, username: clients[socket.id]});
	});
});

