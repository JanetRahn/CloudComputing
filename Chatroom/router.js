/**
 * Routet je nach Pfad zu dem jeweiligen Händler(Funktion)
 * @param handle
 * @param pathname
 * @param response
 * @param postData
 */
function route(handle, pathname, response, postData) {
  console.log("About to route a request for " + pathname);
  if (typeof handle[pathname] === 'function') { //Wenn bekannter Pfad mit Übergebenem Pfad übereinstimmt
    handle[pathname](response, postData); 
  } else { //Wenn unbekannter Pfad
    console.log("No request handler found for " + pathname);
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route;
