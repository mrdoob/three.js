import { Reflector } from '../objects/Reflector.js';

class ReflectorRTT extends Reflector {

	constructor( geometry, options ) {

		super( geometry, options );

		this.geometry.setDrawRange( 0, 0 ); // avoid rendering geometry

	}

}

export { ReflectorRTT };
