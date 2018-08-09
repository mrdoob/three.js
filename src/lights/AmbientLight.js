import { Light } from './Light.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */

class AmbientLight extends Light {

	constructor( color, intensity ) {

		super( color, intensity );

		this.type = 'AmbientLight';

		this.castShadow = undefined;

	}

}

AmbientLight.prototype.isAmbientLight = true;


export { AmbientLight };
