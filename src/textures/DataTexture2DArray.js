import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, NearestFilter } from '../constants.js';

class DataTexture2DArray extends Texture {

	constructor( data, width, height, depth ) {

		super( null );

		Object.defineProperty( this, 'isDataTexture2DArray', { value: true } );

		this.image = { data: data || null, width: width || 1, height: height || 1, depth: depth || 1 };

		this.magFilter = NearestFilter;
		this.minFilter = NearestFilter;

		this.wrapR = ClampToEdgeWrapping;

		this.generateMipmaps = false;
		this.flipY = false;

		this.needsUpdate = true;

	}

}

export { DataTexture2DArray };
