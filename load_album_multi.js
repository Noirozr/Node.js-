var http = require("http"),
	fs = require("fs");
	
function load_album_list(callback) {
	
}

function load_album(album_name, callback) {
	
}

function handle_incoming_request(request, response) {
	console.log("INCOMING REQUEST: " + request.method + " " + request.url);
	if (request.url == '/albums.json') {
		handle_list_albums(request, response);
	} else if (request.url.substr(0, 7) == "/albums" 
				&& request.url.substr(request.url.length - 5) == ".json") {
		handle_get_albums(request, response);
	} else {
		send_failure(response, 404, invalid_resource());
	}
}

function handle_list_albums(request, response) {
	load_album_list(function (err, albums) {
		if (err) {
			send_failure(response, 500, err);
			return;
		}
		
		send_success(response, {albums: albums});
	})
}

function make_error(err, msg) {
	var error = new Error(msg)l
	error.code = err;
	return error;
}

function send_success(response, data) {
	response.writeHead(200, {"Content-Type": "application/json"});
	var output = {error: null, data: data};
	response.end(JSON.stringify(output) + "\n");
}

function send_failure(response, code, error) {
	var errorCode = (error.code) ? error.code : error.name;
	response.writeHead(code, {"Content-Type": "application/json"});
	response.end(JSON.stringify({error: errorCode, message: error.message}) + "\n");
}

function invalid_resource() {
	return make_error("invalid_resource", "The required resource does not exist.");
}

function no_such_album() {
	return make_error("no_such_album", "THe specified album does not exist.");
}

var server = http.createServer(handle_incoming_request);
server.listen(8080);
