/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 */

import { Object3D } from '../core/Object3D.js';
import { SphericalHarmonics3 } from '../math/SphericalHarmonics3.js';
import { Color } from '../math/Color.js';
import { Vector3 } from '../math/Vector3.js';

function AmbientLight( color, intensity ) {

	Object3D.call( this );

	this.type = 'AmbientLight';

	this.sh = new SphericalHarmonics3();

	this.intensity = intensity !== undefined ? intensity : 1;

	if ( color !== undefined ) this.setFromColor( color );

	//this.castShadow = undefined; // needed?

}

AmbientLight.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: AmbientLight,

	isLight: true,

	isAmbientLight: true,

	setFromColor: function ( color ) {

		var color1 = new Color().set( color );

		this.sh.zero();

		// without extra factor of PI in the shader, would be 2 / Math.sqrt( Math.PI );

		this.sh.coefficients[ 0 ].set( color1.r, color1.g, color1.b ).multiplyScalar( 2 * Math.sqrt( Math.PI ) );

		return this;

	},

	setFromHemisphereColors: function ( skyColor, groundColor, /* up */ ) { // todo: support tilt

		var color1 = new Color().set( skyColor );
		var color2 = new Color().set( groundColor );

		var sky = new Vector3( color1.r, color1.g, color1.b );
		var ground = new Vector3( color2.r, color2.g, color2.b );

		// without extra factor of PI in the shader, should = 1 / Math.sqrt( Math.PI );

		var c0 = Math.sqrt( Math.PI );
		var c1 = c0 * Math.sqrt( 0.75 );

		this.sh.zero();

		this.sh.coefficients[ 0 ].copy( sky ).add( ground ).multiplyScalar( c0 );
		this.sh.coefficients[ 1 ].copy( sky ).sub( ground ).multiplyScalar( c1 );

		return this;

	},

	copy: function ( source ) {

		Object3D.prototype.copy.call( this, source );

		this.sh.copy( source.sh );
		this.intensity = source.intensity;

		return this;

	},

	toJSON: function ( meta ) {

		var data = Object3D.prototype.toJSON.call( this, meta );

		data.object.sh = this.sh.toArray();
		data.object.intensity = this.intensity;

		return data;

	}


} );

export { AmbientLight };
