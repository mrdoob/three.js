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

	var texture = new THREE.CompressedTexture();

	texture.image = this.image;
	texture.mipmaps = this.mipmaps;

	texture.format = this.format;
	texture.type = this.type;

	texture.mapping = this.mapping;

	texture.wrapS = this.wrapS;
	texture.wrapT = this.wrapT;

	texture.magFilter = this.magFilter;
	texture.minFilter = this.minFilter;

	texture.anisotropy = this.anisotropy;

	texture.offset.copy( this.offset );
	texture.repeat.copy( this.repeat );

	return texture;

};
