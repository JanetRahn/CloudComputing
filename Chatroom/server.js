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
	var items = Object.keys(clients);
	
	
	socket.on('infoUser', function(username) {
		clients[socket.id] = username;
		items = Object.keys(clients);
		socket.emit('servermessage', 'Welcome to the Chat, ' + username);

		for (var i = 0; i < items.length; i++) {
			if (items[i] !== socket.id) {
				io.to(items[i]).emit('servermessage', username + ' betritt den Chat.');
			}
		}
	});

	socket.on('chatmessage', function(message) {
		console.log('Socket id: ' + socket.id + '  Name: ' + clients[socket.id]	+ '   message: ' + message);
		io.emit('message_to_clients', {
			zeit : new Date(),
			message : message,
			username : clients[socket.id]
		});
	});

	socket.on('disconnect', function(){
		for(var i = 0; i < items.length; i++){
			if(socket.id === items[i]){
				io.emit('servermessage', clients[socket.id] + ' verlässt den Chat.'); 
			
			}
		}
	  });
});


