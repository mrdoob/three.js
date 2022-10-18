import { Light } from './Light.js';

class AmbientLight extends Light {

	constructor( color, intensity ) {

		super( color, intensity );

		this.isAmbientLight = true;

		this.type = 'AmbientLight';

	}

}

export { AmbientLight };
