/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.CompressedTexture = function ( mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter ) {

	THREE.Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type );

	this.image = { width: width, height: height };
	this.mipmaps = mipmaps;

};

THREE.CompressedTexture.prototype = Object.create( THREE.Texture.prototype );

THREE.CompressedTexture.prototype.clone = function () {

	var clonedTexture = new THREE.CompressedTexture( this.mipmaps, this.image.width, this.image.height, this.format, this.type, this.mapping, this.wrapS, this.wrapT, this.magFilter, this.minFilter );

	clonedTexture.offset.copy( this.offset );
	clonedTexture.repeat.copy( this.repeat );

	return clonedTexture;

};
