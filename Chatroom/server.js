var http = require("http"); 
var url = require("url");

/**
 * Startet den Server und überprüft, ob Anfragen gestellt werden
 * @param route Pfadangabe
 * @param handle der zu übergebener Handler	
 */

function start(route, handle) {
  function onRequest(request, response) {
    var postData = "";
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    request.setEncoding("utf8");

    //Listener falls Daten mitgeliefert werden
    request.addListener("data", function(postDataChunk) { 
      postData += postDataChunk;
      console.log("Received POST data chunk "+ postDataChunk + ".");
    });

    //Listener falls eine Anfrage kommt
    request.addListener("end", function() { 
      route(handle, pathname, response, postData);
    }); 
  }
  //Damit der Server unter dem Port "8888" auf eine Anfrage wartet
  http.createServer(onRequest).listen(8888);
  console.log("-----------------------------------------------------");
  console.log("-------- Server URL: http://127.0.0.1:8888/ ---------");
  console.log("-----------------------------------------------------");
  console.log("");
}

exports.start = start;