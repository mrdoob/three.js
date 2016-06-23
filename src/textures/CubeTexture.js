/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.CubeTexture = function ( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

	mapping = mapping !== undefined ? mapping : THREE.CubeReflectionMapping;

	THREE.Texture.call( this, images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.images = images;
	this.flipY = false;

};

THREE.CubeTexture.prototype = Object.create( THREE.Texture.prototype );
THREE.CubeTexture.prototype.constructor = THREE.CubeTexture;

THREE.CubeTexture.prototype.copy = function ( source ) {

	THREE.Texture.prototype.copy.call( this, source );

	this.images = source.images;

	return this;

};
