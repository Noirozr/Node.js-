var http = require("http");



function handle_incoming_request(request, response) {
	console.log("INCOMING REQUEST: " + request.method + " " + request.url);
	
	response.writeHead(200, {"Content-Type": "application/json"});
	response.write(JSON.stringify({error: null}) + "\n");
}

var server = http.createServer(handle_incoming_request);
server.listen(8080);