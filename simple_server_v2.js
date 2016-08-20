var http = require("http")

function handle_incoming_request(request, response) {
	console.log("--------------------");
	console.log(request);
	console.log("--------------------");
	console.log(response);
	response.writeHead(200, {"Content-Type": "application/json"});
	response.end(JSON.stringify({error: null}) + "\n");
}

var server = http.createServer(handle_incoming_request);
server.listen(8080);