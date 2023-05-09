import { Color } from '../math/Color.js';
import { Vector3 } from '../math/Vector3.js';
import { LightProbe } from './LightProbe.js';

class HemisphereLightProbe extends LightProbe {

	constructor( skyColor, groundColor, intensity = 1 ) {

		super( undefined, intensity );

		this.isHemisphereLightProbe = true;

		const sky = new Vector3().setFromColor( new Color( skyColor ) );
		const ground = new Vector3().setFromColor( new Color( groundColor ) );

		// without extra factor of PI in the shader, should = 1 / Math.sqrt( Math.PI );
		const c0 = Math.sqrt( Math.PI );
		const c1 = c0 * Math.sqrt( 0.75 );

		this.sh.coefficients[ 0 ].copy( sky ).add( ground ).multiplyScalar( c0 );
		this.sh.coefficients[ 1 ].copy( sky ).sub( ground ).multiplyScalar( c1 );

	}

}

export { HemisphereLightProbe };
