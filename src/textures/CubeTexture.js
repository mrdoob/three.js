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

THREE.CubeTexture.prototype.clone = function () {

	var texture = new this.constructor( this.images, this.mapping, this.wrapS, this.wrapT, this.magFilter, this.minFilter, this.format, this.type, this.anisotropy );
	return texture.copy( this );

};