import { Color } from '../math/Color.js';
import { LightProbe } from './LightProbe.js';

class AmbientLightProbe extends LightProbe {

	constructor( color, intensity = 1 ) {

		super( undefined, intensity );

		this.isAmbientLightProbe = true;

		const color1 = new Color().set( color );

		this.sh.coefficients[ 0 ].set( color1.r, color1.g, color1.b ).multiplyScalar( 2 / Math.sqrt( Math.PI ) );

	}

}

export { AmbientLightProbe };
