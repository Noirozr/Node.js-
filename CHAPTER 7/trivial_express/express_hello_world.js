var express = require("express");
var app = express();

app.get('/', function (request, response) {
	response.end('Hello World');
});

app.listen(8080);