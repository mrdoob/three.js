/**
 * @author WestLangley / http://github.com/WestLangley
 */

import { _Math } from '../math/Math.js';
import { Vector3 } from '../math/Vector3.js';
import { Color } from '../math/Color.js';
import { SphericalHarmonics3 } from '../math/SphericalHarmonics3.js';
import { LightProbe } from './LightProbe.js';

function HemisphereLightProbe( skyColor, groundColor, intensity ) {

	LightProbe.call( this, undefined, intensity );

	var color1 = new Color().set( skyColor );
	var color2 = new Color().set( groundColor );

	var sky = new THREE.Vector3( color1.r, color1.g, color1.b );
	var ground = new THREE.Vector3( color2.r, color2.g, color2.b );

	// without extra factor of PI in the shader, should = 1 / Math.sqrt( Math.PI );
	var c0 = Math.sqrt( Math.PI );
	var c1 = c0 * Math.sqrt( 0.75 );

	this.sh.coefficients[ 0 ].copy( sky ).add( ground ).multiplyScalar( c0 );
	this.sh.coefficients[ 1 ].copy( sky ).sub( ground ).multiplyScalar( c1 );

}

HemisphereLightProbe.prototype = Object.assign( Object.create( LightProbe.prototype ), {

	constructor: HemisphereLightProbe,

	isHemisphereLightProbe: true,

	copy: function ( source ) { // modifying colors not currently supported

		LightProbe.prototype.copy.call( this, source );

		return this;

	},

	toJSON: function ( meta ) {

		var data = LightProbe.prototype.toJSON.call( this, meta );

		// data.sh = this.sh.toArray(); // todo

		return data;

	}

} );

export { HemisphereLightProbe };
