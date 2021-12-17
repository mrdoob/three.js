import { Light } from './Light.js';

class AmbientLight extends Light {

	constructor( color, intensity ) {

		super( color, intensity );

		this.type = 'AmbientLight';

	}

}

AmbientLight.prototype.isAmbientLight = true;

export { AmbientLight };
