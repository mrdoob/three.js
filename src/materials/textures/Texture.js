/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Texture = function ( image, mapping, wrap_s, wrap_t ) {

	this.image = image;

	this.mapping = mapping !== undefined ? mapping : new THREE.UVMapping();

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

THREE.MultiplyOperation = 0;
THREE.MixOperation = 1;

THREE.RepeatWrapping = 0;
THREE.ClampToEdgeWrapping = 1;
THREE.MirroredRepeatWrapping = 2;
