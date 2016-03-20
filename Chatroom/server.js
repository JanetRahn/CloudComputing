var http = require("http"); 
var url = require("url");
var users = [];
var log = [];
var debug = require('debug'); //Debug
/**
 * Startet den Server und überprüft, ob Anfragen gestellt werden
 * 
 * @param route
 *            Pfadangabe
 * @param handle
 *            der zu übergebener Handler
 */

function start(route, handle) {
  function onRequest(request, response) {
    var postData = "";
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    request.setEncoding("utf8");

    // Listener falls Daten mitgeliefert werden
    request.addListener("data", function(postDataChunk) { 
      postData += postDataChunk;
      console.log("Received POST data chunk "+ postDataChunk + ".");
    });
    
    // Listener falls eine Anfrage kommt
    request.addListener("end", function() { 
      route(handle, pathname, response, postData);
    }); 
  }
  
  
  // Damit der Server unter dem Port "8888" auf eine Anfrage wartet
  var app = http.createServer(onRequest).listen(8888);
  var io = require('socket.io')(app);
  

//  io.sockets.on('connect', function(client) {
//	    clients.push(client); 
//
//	    client.on('disconnect', function() {
//	        clients.splice(clients.indexOf(client), 1);
//	    });
//	});
  
  io.sockets.on('connection', function(socket) {
	  console.log("user connected");
	  
	//speichert user in socket-Session
      socket.on('adduser', function (username) {
          socket.username = username;
          users[username] = username;
          console.log(socket.username);

      });
	  
      socket.on('message_to_server', function (data) {
          //username kann nicht aus Session abgerufen werden warum auch immer.
          console.log(socket.username + ': ' + data['message']);
        //  io.sockets.emit('message_to_client', {message: data['message'], username: socket.user});
          io.sockets.emit('message_to_client', {message : data['message'], username:socket.username
          });
      });
      
      socket.on('disconnect', function(socket){
    		 console.log("user disconnected"); 
    	  });
  });
  
 
  
  io.listen(app);
  console.log("-----------------------------------------------------");
  console.log("-------- Server URL: http://127.0.0.1:8888/ ---------");
  console.log("-----------------------------------------------------");
  console.log("");
}

exports.start = start;
