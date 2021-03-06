var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var fs = require('fs');
var bodyParser = require('body-parser');

// Map für Clients und die dazugehörige Socketid
var clients = {};
// geparstes Array Objekt von Clients für den Zugriff und Iteration
var socketIDs = [];

// für den statischen Zugriff auf HTML/CSS Seien
app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended : true
}));

/**
 * Requesthandler als Middleware. Username wird aus der Request entnommen und
 * überprüft, ob der Name bereits in Verwendung ist. Falls der Name in
 * Verwendung ist, wird ein Redirect durchgefüht und als Hashparamter ein Error
 * übergeben, der auf der Client-Seite abgefangen wird und die entsprechende
 * Meldung dafür ausgibt
 */
app.post('/joinChat', function(req, res) {
	// Überprüfung, ob Username bereits verwendet wird
	var ok = true;
	if (socketIDs.length !== 0) {
		for (var i = 0; i < socketIDs.length; i++) {
			if (req.body.username === clients[socketIDs[i]]) {
				ok = false;
				res.redirect("index.html" + "#error");
			}
		}
	}
	if (ok) {
		res.sendFile(__dirname + '/public/chat.html');
		ok = true;
	}
});

/**
 * Server ist gestartet
 */
http.listen(8888, function() {
	console.log("-----------------------------------------------------");
	console.log("-------- Server URL: http://127.0.0.1:8888/ ---------");
	console.log("-----------------------------------------------------");
	console.log("");
});

/**
 * Überprüft den eingegebenen Username, ob dieser in der Liste vorhanden ist.
 * eine private Nachricht an sich, kann nicht geschrieben werden.
 * @param usernameTo Eingegebener Username
 * @param socket Aktueller Socket
 * @returns {Boolean} Gibt zurück, ob Username in der Liste vorhanden ist.
 */
function checkUsername(usernameTo, socket) {
	var inList = false;
	if (usernameTo !== clients[socket.id]) {
		for (var i = 0; i < socketIDs.length; i++) {
			if (usernameTo === clients[socketIDs[i]]) {
				inList = true;
			}
		}
	}

	return inList;
}

/**
 * Websocket: Connection für den Kommunikationsaufbau zwischen Client und Server
 */
io.sockets.on('connection', function(socket) {
	socketIDs = Object.keys(clients);

	/**
	 * infoUser: Bekommt vom Client den Username, damit dieser mit seiner
	 * Socketid in die Map gespeichert werden kann. Map(clients) wird in ein
	 * Array für den Zugriff geparst (socketIds - siehe oben). Eine
	 * Willkommensnachricht wird nur an diesen einen Client über seine Socketid
	 * geschickt. Zusätzlich werden alle anderen Clients von seinem Beitritt
	 * benachrichtig
	 */
	socket.on('infoUser', function(username) {
		clients[socket.id] = username;
		console.log(username);
		socketIDs = Object.keys(clients);
		socket.emit('servermessage', 'Welcome to the Chat, ' + username +"<br> <font color='#7BF954'><i> Info: Um eine private Nachricht zu schreiben, schreibe '/priv Username' [Enter], <br> um zu überprüfen wer im Moment online ist, tippe '/list' </i></font>");

		for (var i = 0; i < socketIDs.length; i++) {
			if (socketIDs[i] !== socket.id) {
				io.to(socketIDs[i]).emit('servermessage',
						username + ' betritt den Chat.');
			}
		}
	});

	/**
	 * chatmessage: überprüft Nachrichten, ob es ein Kommando ist oder eine
	 * normale Chatnachricht an alle. Wird als Kommando "/priv username" eingegeben
	 * so erhält der User in seinem Textfeld ein Feedback-Text, an wen die
	 * Nachricht geht. Danach kann dieser seine Nachricht direkt hinter diesem
	 * Text eingeben und abschicken. Überprüft wird hierbei der String ("Private
	 * Message to" erhält der Text diesen String + den Username, so wird eine
	 * private Nachricht an diesen Usernamen geschickt (funktioniert also auch
	 * ohne Kommando) Ist der Username nicht vorhanden erhält der User eine
	 * Nachricht mit "User nicht vorhanden"
	 * 
	 * Wird Kommando "/list" ausgeführt, so erhält der Benutzer eine Liste mit allen Benutzern, die zurzeit online sind
	 * 
	 */
	socket.on('chatmessage', function(message) {
		var usernameTo = "";
		if (message.startsWith("/")) {
			var command = message.substring(1, 5);
			var available = false;
			switch (command) {
			case "priv":
				usernameTo = message.substr(6);
				// Leerzeichen löschen
				usernameTo = usernameTo.trim(" ");

				available = checkUsername(usernameTo, socket);

				socket.emit('UserAvailableForPrivateMessage', {
					available : available,
					usernameTo : usernameTo
				});
				available = false;
				break;
			case "list":
				var userOnline = "";
				for (var j = 0; j < socketIDs.length; j++) {
					userOnline += clients[socketIDs[j]] + " ";
				}
				socket.emit('servermessage',
						"<span class = 'onlineList'> Online: " + userOnline
								+ "</span>");
				break;
			}
		} else {
			if (message.startsWith("Private Message to")) {
				message = message.replace("Private Message to ", "");
				usernameTo = message.substring(0, message.lastIndexOf(":"));
				if (checkUsername(usernameTo, socket) === true) {
					var tmp = usernameTo + ":";
					message = message.replace(tmp, "").trim(" ");
					message = "<span class='privateMessage'>" + message
							+ "<span>";
					for (var j = 0; j < socketIDs.length; j++) {
						if (usernameTo === clients[socketIDs[j]]
								|| socket.id === clients[socketIDs[j]]) {
							io.to(socketIDs[j]).emit('message_to_client', {
								zeit : new Date(),
								message : message,
								username : clients[socket.id],
							});
							socket.emit('message_to_client', {
								zeit : new Date(),
								message : message,
								username : clients[socket.id],
							});
						}
					}
				} else {
					socket.emit('UserAvailableForPrivateMessage', {
						available : false,
						usernameTo : usernameTo
					});
				}
			} else {
				io.emit('message_to_client', {
					zeit : new Date(),
					message : message,
					username : clients[socket.id]
				});
			}
		}
	});

	/**
	 * User, der sich ausloggt (Fenster schließt) wird aus der Liste entnommen
	 * und es wird eine Broadcast-Nachricht an alle gesendet und informariert,
	 * dass dieser Benutzer den Chat verlassen hat
	 */
	socket.on('disconnect', function() {
		for (var i = 0; i < socketIDs.length; i++) {
			if (socket.id === socketIDs[i]) {
				io.emit('servermessage', clients[socket.id]
						+ ' verlässt den Chat.');
				delete clients[socket.id];
				socketIDs = Object.keys(clients);
			}
		}
	});
});
