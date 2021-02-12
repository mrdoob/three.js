import { Color } from '../math/Color.js';
import { Vector3 } from '../math/Vector3.js';
import { LightProbe } from './LightProbe.js';

class HemisphereLightProbe extends LightProbe {

	constructor( skyColor, groundColor, intensity = 1 ) {

		super( undefined, intensity );

		Object.defineProperty( this, 'isHemisphereLightProbe', { value: true } );

		const color1 = new Color().set( skyColor );
		const color2 = new Color().set( groundColor );

		const sky = new Vector3( color1.r, color1.g, color1.b );
		const ground = new Vector3( color2.r, color2.g, color2.b );

		// without extra factor of PI in the shader, should = 1 / Math.sqrt( Math.PI );
		const c0 = Math.sqrt( Math.PI );
		const c1 = c0 * Math.sqrt( 0.75 );

		this.sh.coefficients[ 0 ].copy( sky ).add( ground ).multiplyScalar( c0 );
		this.sh.coefficients[ 1 ].copy( sky ).sub( ground ).multiplyScalar( c1 );

	}

}

export { HemisphereLightProbe };
