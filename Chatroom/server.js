var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var fs = require('fs');

var clients = {};
var socketIDs;

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
	socketIDs = Object.keys(clients);	
	
	socket.on('infoUser', function(username) {
		clients[socket.id] = username;
		socketIDs = Object.keys(clients);
		socket.emit('servermessage', 'Welcome to the Chat, ' + username);

		for (var i = 0; i < socketIDs.length; i++) {
			if (socketIDs[i] !== socket.id) {
				io.to(socketIDs[i]).emit('servermessage', username + ' betritt den Chat.');
			}
		}
	});
	
	socket.on('chatmessage', function(message) {
		console.log('Socket id: ' + socket.id + '  Name: ' + clients[socket.id]	+ '   message: ' + message);
		var usernameTo = "";
		if(message.startsWith("/")){
			var command = message.substring(1, 2);
			var available = false;
			switch (command){
			case "w":
				usernameTo = message.substr(3);
				//Leerzeichen löschen 
				usernameTo = usernameTo.trim(" ");
				for(var i = 0; i < socketIDs.length; i++){
					if(usernameTo === clients[socketIDs[i]]){
						available = true;
					}
				}
				socket.emit('UserAvailableForPrivateMessage', {
					available : available,
					usernameTo : usernameTo
				});
				available = false; 
				break;
			case "o": 
				console.log("online");
				break;
			}
		}else{
			if(message.startsWith("Private Message an")){
				message = message.replace("Private Message an ", "");
				usernameTo = message.substring(0, message.lastIndexOf(":")); 
				var tmp = usernameTo + ":";
				message = message.replace(tmp, "").trim(" ");
				
				message = "<span class='privateMessage'>" + message + "<span>";
				for(var j = 0; j < socketIDs.length; j++){
					if(usernameTo === clients[socketIDs[j]] || socket.id === clients[socketIDs[j]]){
						io.to(socketIDs[j]).emit('message_to_client',{
								zeit : new Date(),
								message : message,
								username : clients[socket.id],
						});
						socket.emit('message_to_client',{
						zeit : new Date(),
						message : message,
						username : clients[socket.id],
						});
					}
				}
			}else{
				io.emit('message_to_client', {
					zeit : new Date(),
					message : message,
					username : clients[socket.id]
				});
			}
		}
	});

	socket.on('disconnect', function(){
		for (var i = 0; i < socketIDs.length; i++) {
			if (socket.id === socketIDs[i]) {
				io.emit('servermessage', clients[socket.id] + ' verlässt den Chat.');
				delete clients[socket.id];
				socketIDs = Object.keys(clients);
			}
		}
	  });
});