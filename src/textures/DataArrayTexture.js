import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, NearestFilter } from '../constants.js';

class DataArrayTexture extends Texture {

	constructor( data = null, width = 1, height = 1, depth = 1, format, type, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, colorSpace ) {

		super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace );

		this.isDataArrayTexture = true;

		this.image = { data, width, height, depth };

		this.wrapR = ClampToEdgeWrapping;

		this.generateMipmaps = false;
		this.flipY = false;
		this.unpackAlignment = 1;

		this.layerUpdates = new Set();

	}

	addLayerUpdate( layerIndex ) {

		this.layerUpdates.add( layerIndex );

	}

	clearLayerUpdates() {

		this.layerUpdates.clear();

	}

}

export { DataArrayTexture };
