var querystring = require("querystring");
var fs = require('fs');

/**
 * Funktion wird bei Aufruf der Seite ausgeführt
 * @param response
 * @param postData
 */

function start(response, postData) {
	console.log("Request handler 'start' was called.");
	fs.readFile('./view/login.html', function(err, html) {
		if (err) {
			throw err;
		}
		response.writeHead(200, {
			"Content-Type" : "text/html",
		});
		response.write(html);
		response.end();
	
	});
}
/**
 * Funktion wird durch Klick auf den Login-Button aufegruden
 * @param response HTML-Seite wird an den Client übergeben
 * @param postData
 */
// Nach dem Clicken auf den Button
function joinChat(response, postData) {
	fs.readFile('./view/chat.html', function(err, html) {
		if (err) {
			throw err;
		}
		response.writeHead(200, {
			"Content-Type" : "text/html",
		});
		response.write(html);
		response.end();
	});
}

exports.start = start;
exports.joinChat = joinChat;
