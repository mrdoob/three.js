import { Texture } from './Texture';

/**
 * @author alteredq / http://alteredqualia.com/
 */

function CompressedTexture( mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding ) {

	Texture.call( this, null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding );

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

CompressedTexture.prototype.isCompressedTexture = true;


export { CompressedTexture };
