/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * }
 */

THREE.TextureCube = function ( image, mapping ) {

	this.image = image;
	this.mapping = mapping ? mapping : THREE.ReflectionMap;

	this.toString = function () {

		return 'THREE.TextureCube (<br/>' +
			'image: ' + this.image + '<br/>' +
			'mapping: ' + this.mapping + '<br/>' +
			')';

	};

};
