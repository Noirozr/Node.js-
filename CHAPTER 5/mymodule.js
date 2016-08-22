exports.hello_world = function () {
	console.log("Hello, world");
}

exports.goodBye = function () {
	console.log("Goodbye~");
}

function Greeter(lang) {
	this.language = lang;
	this.greet = function () {
		switch (this.language) {
			case "en":
				return "Hello";
			case "de":
				return "Hallo!";
			case "cn":
				return "你好";
			default:
				return "No speaka that language";
		}
	}
}

exports.create_greeter = function (lang) {
	return new Greeter(lang);
}