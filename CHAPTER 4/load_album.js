var http = require("http"),
	fs = require("fs");

function load_album_list(callback) {
	fs.readdir(
		"albums",
		function (error, files) {
			if (error) {
				callback(error);
				return;
			}
			
			callback(null, files);
		}
	);
}

function handle_incoming_request(request, response) {
	console.log("INCOMING REQUEST: " + request.method + " " + request.url);
	
	load_album_list(function (error, albums) {
		if(error) {
			response.writeHead(503, {"Content-Type": "application/json"});
			response.end(JSON.stringify(error) + "\n");
			return;
		}
		
		var out = {
			error: null,
			data: {albums: albums}
		};
		
		response.writeHead(200, {"Content-Type": "application/json"});	
		response.end(JSON.stringify(out) + "\n");
	});
}

var server = http.createServer(handle_incoming_request);
server.listen(8080);