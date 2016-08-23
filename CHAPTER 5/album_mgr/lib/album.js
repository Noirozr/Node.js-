function Album (album_path) {
	this.name = path.basename(album_path);
	this.path = album_path;
}

Album.prototype.name = null;
Album.prototype.path = null;
Album.prototype._photos = null;

//remain to be done