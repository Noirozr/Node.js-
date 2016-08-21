var http = require("http"),
	url = require("url"),
	fs = require("fs");

function do_rename(old_name, new_name, callback) {
	fs.rename(
	"albums/" + old_name,
	"albums/" + new_name, 
	callback);
}
	
function load_album_list(callback) {
	fs.readdir(
		"albums", function (err, files) {
			if(err) {
				callback(make_error("file_error", JSON.stringify(err)));
				return;			
			}
			
			var only_dirs = [];
			(function iterator(index) {
				if (index == files.length) {
					callback(null, only_dirs);
					return;
				}
				
				fs.stat(
				"albums/" + files[index], 
				function (err, stats) {
					if (err) {
						callback(make_error("file_error", JSON.stringify(err)));
						return;
					}
					
					if (stats.isDirectory()) {
						var obj = {name: files[index]};
						only_dirs.push(obj);
					}
					
					iterator(index + 1)
				});
			})(0);
		});
}

function load_album(album_name, page, page_size, callback) {
	fs.readdir(
	"albums" + album_name, function (err, files) {
		if(err) {
			if (err.code == "ENOENT") {
				callback(no_such_album());
			} else {
				callback(make_error("file_error", JSON.stringify(err)));
			}
			return;			
		}
		
		var only_files = [];
		var path = "albums/" + album_name + "/";
		
		(function iterator(index) {
			if (index == files.length) {
				var ps;
				ps = only_files.splice(page * page_size, page_size);
				var obj = {
					short_name: album_name,
					photos: ps
				};
				callback(null, obj);
				return;
			}
			
			fs.stat(
			path + files[index], 
			function (err, stats) {
				if (err) {
					callback(make_error("file_error", JSON.stringify(err)));
					return;
				}
				
				if (stats.isFile()) {
					var obj = {
						filename: files[index],
						desc: files[index]
					};
					only_files.push(obj);
				}
				
				iterator(index + 1)
			});
		})(0);
	});
}

function handle_incoming_request(request, response) {
	
	request.parsed_url = url.parse(request.url, true);
	var core_url = request.parsed_url.pathname;
	
	if (core_url == '/albums.json' && request.method.toLowerCase() == 'get') {
		handle_list_albums(request, response);
	} else if (core_url.substr(core_url.length -12) == '/rename.json'
				&& request.method.toLowerCase() == 'post') {
		handle_rename_album(request, response);
	} else if (core_url.substr(0, 7) == "/albums" 
				&& core_url.substr(core_url.length - 5) == ".json"
				&& request.method.toLowerCase() == 'get') {
		handle_get_albums(request, response);
	} else {
		console.log("handle_incoming_request_problem");
		console.log(core_url.substr(core_url.length -12));
		send_failure(response, 404, invalid_resource());
	}
}

function handle_rename_album(request, response) {
	var core_url = request.parsed_url.pathname;
	var parts = core_url.split('/');
	
	if (parts.length != 4) {
		console.log("length != 4");
		send_failure(response, 404, invalid_resource(core_url));
		return;
	}
	
	var album_name = parts[2];
	
	var json_body = '';
	request.on(
		'readable',
		function () {
			var d = request.read();
			if (d) {
				if (typeof d == 'string') {
					json_body += d;
				} else if (typeof d == 'object' && d instanceof Buffer){
					json_body += d.toString('utf8');
				}
			}
		}
	);
	
	request.on(
		'end',
		function () {
			if (json_body) {
				try {
					var album_data = JSON.parse(json_body);
					if (!album_data.album_name) {
						send_failure(response, 403, missing_data('album_name'));
						return;
					}
				} catch (e) {
					send_failure(response, 403, bad_json());
					return;
				}
				
				do_rename(
					album_name,
					album_data.album_name,
					function (err, results) {
						if (err && err.code == "ENOENT") {
							send_failure(response, 403, no_such_album());
							return;
						} else if (err) {
							send_failure(response, 500, file_error(err));
							return;
						}
						send_success(response, null);
					}
				);
			} else {
				send_failure(response, 403, bad_json());
				response.end();
			}
		}
	);
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

function handle_get_albums(request, response) {
	
	var getp = request.parsed_url.query;
	var page_num = getp.page ? getp.page : 0;
	var page_size = getp.page_size ? getp.page_size : 0;
	
	if (isNaN(parseInt(page_num))) page_num = 0;
	if (isNaN(parseInt(page_size))) page_size = 0;
	
	var core_url = request.parsed_url.pathname;
	
	var album_name = core_url.substr(7, core_url.length - 12);
	load_album(
	album_name,
	page_num,
	page_size, 
	function (err, album_contents) {
		if (err && err.error == "no_such_album") {
			send_failure(response, 404, err);
		} else if (err) {
			send_failure(response, 500, err);
		} else {
			send_success(response, {album_data: album_contents});
		}
	});
}

function make_error(err, msg) {
	var error = new Error(msg);
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