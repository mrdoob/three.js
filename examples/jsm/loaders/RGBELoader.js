import { HDRLoader } from './HDRLoader.js';

// @deprecated, r180

class RGBELoader extends HDRLoader {

	constructor( manager, parameters = {} ) {

		console.warn( 'RGBELoader has been deprecated. Please use HDRLoader instead.' );
		super( manager, parameters );

	}

}

export { RGBELoader };


