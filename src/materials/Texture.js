/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 */

THREE.Texture = function ( image, mapping, wrap_s, wrap_t, mag_filter, min_filter ) {

	this.image = image;

	this.mapping = mapping !== undefined ? mapping : new THREE.UVMapping();

	this.wrap_s = wrap_s !== undefined ? wrap_s : THREE.ClampToEdgeWrapping;
	this.wrap_t = wrap_t !== undefined ? wrap_t : THREE.ClampToEdgeWrapping;

	this.mag_filter = mag_filter !== undefined ? mag_filter : THREE.LinearFilter;
	this.min_filter = min_filter !== undefined ? min_filter : THREE.LinearMipMapLinearFilter;

};

THREE.Texture.prototype = {

	clone: function () {

		return new THREE.Texture( this.image, this.mapping, this.wrap_s, this.wrap_t, this.mag_filter, this.min_filter );

	},

	toString: function () {

		return 'THREE.Texture (<br/>' +
			'image: ' + this.image + '<br/>' +
			'wrap_s: ' + this.wrap_s + '<br/>' +
			'wrap_t: ' + this.wrap_t + '<br/>' +
			'mag_filter: ' + this.mag_filter + '<br/>' +
			'min_filter: ' + this.min_filter + '<br/>' +
			')';

	}

};

THREE.MultiplyOperation = 0;
THREE.MixOperation = 1;

// Wrapping modes

THREE.RepeatWrapping = 0;
THREE.ClampToEdgeWrapping = 1;
THREE.MirroredRepeatWrapping = 2;

// Filters

THREE.NearestFilter = 3;
THREE.NearestMipMapNearestFilter = 4;
THREE.NearestMipMapLinearFilter = 5;
THREE.LinearFilter = 6;
THREE.LinearMipMapNearestFilter = 7;
THREE.LinearMipMapLinearFilter = 8;

// Types

THREE.ByteType = 9;
THREE.UnsignedByteType = 10;
THREE.ShortType = 11;
THREE.UnsignedShortType = 12;
THREE.IntType = 13;
THREE.UnsignedIntType = 14;
THREE.FloatType = 15;

// Formats

THREE.AlphaFormat = 16;
THREE.RGBFormat = 17;
THREE.RGBAFormat = 18;
THREE.LuminanceFormat = 19;
THREE.LuminanceAlphaFormat = 20;
