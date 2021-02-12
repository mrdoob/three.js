import { Light } from './Light.js';

class AmbientLight extends Light {

	constructor( color, intensity ) {

		super( color, intensity );

		this.type = 'AmbientLight';
		Object.defineProperty( this, 'isAmbientLight', { value: true } );

	}

}


export { AmbientLight };
