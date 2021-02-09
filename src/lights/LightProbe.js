import { SphericalHarmonics3 } from '../math/SphericalHarmonics3.js';
import { Light } from './Light.js';

class LightProbe extends Light {

	constructor( sh = new SphericalHarmonics3(), intensity = 1 ) {

		super( undefined, intensity );

		Object.defineProperty( this, 'isLightProbe', { value: true } );

		this.sh = sh;

	}

	copy( source ) {

		super.copy( source );

		this.sh.copy( source.sh );

		return this;

	}

	fromJSON( json ) {

		this.intensity = json.intensity; // TODO: Move this bit to Light.fromJSON();
		this.sh.fromArray( json.sh );

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.sh = this.sh.toArray();

		return data;

	}

}

export { LightProbe };
