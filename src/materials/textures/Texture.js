/**
 * @author mr.doob / http://mrdoob.com/
 * }
 */

THREE.Texture = function ( image, mapping ) {

	this.image = image;
	this.mapping = mapping ? mapping : THREE.UVMapping;

	this.toString = function () {

		return 'THREE.Texture (<br/>' +
			'image: ' + this.image + '<br/>' +
			'mapping: ' + this.mapping + '<br/>' +
			')';

	};

};

THREE.UVMapping = 0;
THREE.ReflectionMap = 1;
THREE.RefractionMap = 2;

THREE.Multiply = 0;
THREE.Mix = 1;
