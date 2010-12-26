/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
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

THREE.RepeatWrapping = 0;
THREE.ClampToEdgeWrapping = 1;
THREE.MirroredRepeatWrapping = 2;

THREE.NearestFilter = 3;
THREE.NearestMipMapNearestFilter = 4;
THREE.NearestMipMapLinearFilter = 5;
THREE.LinearFilter = 6;
THREE.LinearMipMapNearestFilter = 7;
THREE.LinearMipMapLinearFilter = 8;
