import { USDLoader } from './USDLoader.js';

// @deprecated, r179

class USDZLoader extends USDLoader {

	constructor( manager, parameters = {} ) {

		console.warn( 'USDZLoader has been deprecated. Please use USDLoader instead.' );
		super( manager, parameters );

	}

}

export { USDZLoader };
