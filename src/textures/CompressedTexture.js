/**
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = CompressedTexture;

var Texture = require( "./Texture" );

function CompressedTexture( mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy ) {

	Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

	this.image = { width: width, height: height };
	this.mipmaps = mipmaps;

	// no flipping for cube textures
	// (also flipping doesn't work for compressed textures )

	this.flipY = false;

	// can't generate mipmaps for compressed textures
	// mips must be embedded in DDS files

	this.generateMipmaps = false;

}

CompressedTexture.prototype = Object.create( Texture.prototype );
CompressedTexture.prototype.constructor = CompressedTexture;
