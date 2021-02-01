import { Texture } from './Texture.js';
import { ClampToEdgeWrapping, NearestFilter } from '../constants.js';

class DataTexture2DArray extends Texture {

	constructor( data = null, width = 1, height = 1, depth = 1 ) {

		super( null );

		Object.defineProperty( this, 'isDataTexture2DArray', { value: true } );

		this.image = { data, width, height, depth };

		this.magFilter = NearestFilter;
		this.minFilter = NearestFilter;

		this.wrapR = ClampToEdgeWrapping;

		this.generateMipmaps = false;
		this.flipY = false;

		this.needsUpdate = true;

	}

}

export { DataTexture2DArray };
