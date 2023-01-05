import { SpotLight } from 'three';

class IESSpotLight extends SpotLight {

	constructor( color, intensity, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 2 ) {

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
