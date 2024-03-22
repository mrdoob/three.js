import { ClampToEdgeWrapping } from '../constants.js';
import { CompressedTexture } from './CompressedTexture.js';

class CompressedArrayTexture extends CompressedTexture {

	constructor( mipmaps, width, height, depth, format, type ) {

		super( mipmaps, width, height, format, type );

		this.isCompressedArrayTexture = true;
		this.image.depth = depth;
		this.wrapR = ClampToEdgeWrapping;
		this.dirtyLayers = [];

	}

	set layerNeedsUpdate( layerIndex ) {

		this.needsUpdate = true;
		this.dirtyLayers.push( layerIndex );

	}

}

export { CompressedArrayTexture };
