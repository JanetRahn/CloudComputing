//Variablen die auf JS-Dateien "zeigen" (Einbindung in das Projekt)
var server = require("./server"); 
var router = require("./router");
var requestHandlers = require("./requestHandlersLogin");

var handle = {};
handle["/"] = requestHandlers.start;
handle["/joinChat"] = requestHandlers.joinChat;

server.start(router.route, handle);
