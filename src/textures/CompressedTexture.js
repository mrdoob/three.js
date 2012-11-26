/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.CompressedTexture = function ( mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy ) {

	THREE.Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.image = { width: width, height: height };
	this.mipmaps = mipmaps;

	this.generateMipmaps = false; // WebGL currently can't generate mipmaps for compressed textures, they must be embedded in DDS file

};

THREE.CompressedTexture.prototype = Object.create( THREE.Texture.prototype );

THREE.CompressedTexture.prototype.clone = function () {

	var texture = new THREE.CompressedTexture();

	THREE.Texture.prototype.clone.call( this, texture );

	return texture;

};
