import { USDLoader } from './USDLoader.js';

// @deprecated, r179

class USDZLoader extends USDLoader {

	constructor( manager ) {

		console.warn( 'USDZLoader has been deprecated. Please use USDLoader instead.' );
		super( manager );

	}

}

export { USDZLoader };
