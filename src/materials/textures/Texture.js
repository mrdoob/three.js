/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * }
 */

THREE.Texture = function ( image, mapping, wrap_s, wrap_t ) {

	this.image = image;
	this.mapping = mapping !== undefined ? mapping : THREE.UVMapping;
	
	this.wrap_s = wrap_s !== undefined ? wrap_s : THREE.ClampToEdge;
	this.wrap_t = wrap_t !== undefined ? wrap_t : THREE.ClampToEdge;
	
	this.toString = function () {

		return 'THREE.Texture (<br/>' +
			'image: ' + this.image + '<br/>' +
			'wrap_s: ' + this.wrap_s + '<br/>' +
			'wrap_t: ' + this.wrap_t + '<br/>' +
			')';

	};

};

THREE.UVMapping = 0;
THREE.ReflectionMap = 1;
THREE.RefractionMap = 2;

THREE.Multiply = 0;
THREE.Mix = 1;

THREE.Repeat = 0;
THREE.ClampToEdge = 1;
THREE.MirroredRepeat = 2;
