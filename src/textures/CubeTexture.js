/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CubeTexture = function ( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	images = images !== undefined ? images : [];
	mapping = mapping !== undefined ? mapping : THREE.CubeReflectionMapping;

	THREE.Texture.call( this, images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.flipY = false;

};

THREE.CubeTexture.prototype = Object.create( THREE.Texture.prototype );
THREE.CubeTexture.prototype.constructor = THREE.CubeTexture;

Object.defineProperty( THREE.CubeTexture.prototype, 'images', {

	get: function () {

		return this.image;

	},

	set: function ( value ) {

		this.image = value;

	}

} );
