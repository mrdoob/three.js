import { SpotLight } from '../SpotLight.js';

class IESSpotLight extends SpotLight {

	constructor( color, intensity, distance, angle, penumbra, decay ) {

		super( color, intensity, distance, angle, penumbra, decay );

		this.iesMap = null;

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.iesMap = source.iesMap;

		return this;

	}

}

export default IESSpotLight;
