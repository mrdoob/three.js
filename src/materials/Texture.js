/**
 * @author mr.doob / http://mrdoob.com/
 * }
 */

THREE.Texture = function ( image, mapping ) {

	this.image = image;
	this.mapping = mapping;

	this.toString = function () {

		return 'THREE.Texture (<br/>' +
			'image: ' + this.image + '<br/>' +
			'mapping: ' + this.mapping + '<br/>' +
			')';

	};

};
