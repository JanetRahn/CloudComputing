//Bibliotheken werden importiert und sind während der Laufzeit verfügbar
var server = require("./server"); 
var router = require("./router");
var requestHandlers = require("./requestHandlersLogin");

var handle = {};
handle["/"] = requestHandlers.start;
handle["/joinChat"] = requestHandlers.joinChat;

server.start(router.route, handle);
