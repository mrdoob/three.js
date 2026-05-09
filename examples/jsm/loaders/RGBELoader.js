import { HDRLoader } from './HDRLoader.js';

// @deprecated, r180

class RGBELoader extends HDRLoader {

	constructor( manager ) {

		console.warn( 'RGBELoader has been deprecated. Please use HDRLoader instead.' );
		super( manager );

	}

}

export { RGBELoader };


