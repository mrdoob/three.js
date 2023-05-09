import { Color } from '../math/Color.js';
import { LightProbe } from './LightProbe.js';

class AmbientLightProbe extends LightProbe {

	constructor( color, intensity = 1 ) {

		super( undefined, intensity );

		this.isAmbientLightProbe = true;

		// without extra factor of PI in the shader, would be 2 / Math.sqrt( Math.PI );
		this.sh.coefficients[ 0 ].setFromColor( new Color( color ) ).multiplyScalar( 2 * Math.sqrt( Math.PI ) );

	}

}

export { AmbientLightProbe };
