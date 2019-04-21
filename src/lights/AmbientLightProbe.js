/**
 * @author WestLangley / http://github.com/WestLangley
 */

import { _Math } from '../math/Math.js';
import { Vector3 } from '../math/Vector3.js';
import { Color } from '../math/Color.js';
import { SphericalHarmonics3 } from '../math/SphericalHarmonics3.js';
import { LightProbe } from './LightProbe.js';

function AmbientLightProbe( color, intensity ) {

	LightProbe.call( this, undefined, intensity );

	var color1 = new Color().set( color );

	// without extra factor of PI in the shader, would be 2 / Math.sqrt( Math.PI );
	this.sh.coefficients[ 0 ].set( color1.r, color1.g, color1.b ).multiplyScalar(  2 * Math.sqrt( Math.PI ) );

}

AmbientLightProbe.prototype = Object.assign( Object.create( LightProbe.prototype ), {

	constructor: AmbientLightProbe,

	isAmbientLightProbe: true,

	copy: function ( source ) { // modifying color not currently supported

		LightProbe.prototype.copy.call( this, source );

		return this;

	},

	toJSON: function ( meta ) {

		var data = LightProbe.prototype.toJSON.call( this, meta );

		// data.sh = this.sh.toArray(); // todo

		return data;

	}

} );

export { AmbientLightProbe };
