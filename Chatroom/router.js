var path = require('path');
var fs = require('fs');
/**
 * Routet je nach Pfad zu dem jeweiligen Händler(Funktion)
 * CSS wird hier als statische Seite gelesen
 * @param handle
 * @param pathname
 * @param response
 * @param postData
 */
function route(handle, pathname, response, postData) {
  console.log("About to route a request for " + pathname);
  if (typeof handle[pathname] === 'function') { //Wenn bekannter Pfad mit Übergebenem Pfad übereinstimmt
    handle[pathname](response, postData); 
  } else if (path.extname(pathname) === '.css'){
	  response.writeHead(200, {"Content-Type": "text/css"});
	  fs.readFile('./view/' + pathname, 'utf8', function(err, fd) {
          response.end(fd);
      });
	  console.log('Routed for Cascading Style Sheet '+ pathname +' Successfully\n');
  }else { //Wenn unbekannter Pfad
    console.log("No request handler found for " + pathname);
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route;
