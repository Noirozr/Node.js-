var http =require("http"),
	fs = require("fs");

function load_album_list(callback) {
	fs.readdir("albums", function (err, files) {
		if(err) {
			callback(err);
			return;
		}
		
		var only_dirs = [];
		(function iterator(index) {
			if(index == files.length) {
				callback(null, only_dirs);
				return;
			}
			
			fs.stat(
				"albums/" + files[index],
				function (err, stats) {
					if(err) {
						callback(err);
						return;
					}
					
					if(stats.isDirectory()) {
						only_dirs.push(files[index]);
					}
					iterator(index + 1)
				}
			);
		})(0);
		
	});
}


function handle_incoming_request(request, response) {
	console.log("INCOMING REQUEST: " + request.method + " " + request.url);
	load_album_list(function (error, albums) {
		if (error) {
			response.writeHead(502, {"Content-Type": "application/json"});
			response.end(JSON.stringify(error) + "\n");
			return;
		}
		
		var out = {
			error: null,
			data: {albums: albums}
		};
		
		response.writeHead(200, {"Content-Type": "application/json"});
		response.end(JSON.stringify(out) + "\n");
	})
}


var server = http.createServer(handle_incoming_request);
server.listen(8080);