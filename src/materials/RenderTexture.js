THREE.RenderTexture = function ( width, height, options ) {

	this.width = width;
	this.height = height;

	options = options || {};

	this.wrap_s = options.wrap_s !== undefined ? options.wrap_s : THREE.ClampToEdgeWrapping;
	this.wrap_t = options.wrap_t !== undefined ? options.wrap_t : THREE.ClampToEdgeWrapping;

	this.mag_filter = options.mag_filter !== undefined ? options.mag_filter : THREE.LinearFilter;
	this.min_filter = options.min_filter !== undefined ? options.min_filter : THREE.LinearFilter;

	this.format = options.format !== undefined ? options.format : THREE.RGBFormat;
	this.type = options.type !== undefined ? options.type : THREE.UnsignedByteType;

};
