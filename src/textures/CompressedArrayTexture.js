import { ClampToEdgeWrapping } from '../constants.js';
import { CompressedTexture } from './CompressedTexture.js';

class CompressedArrayTexture extends CompressedTexture {

	constructor( depth, mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding ) {

		super( mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding );

		this.isDataArrayTexture = true;
		this.image.depth = depth;
		this.wrapR = ClampToEdgeWrapping;

	}

}

export { CompressedArrayTexture };
