import { Light } from './Light.js';

/**
 * @author Andreas Atteneder
 */

function SphericalHarmonicsLight( sphericalHarmonics3, intensity = 1.0 ) {

	Light.call( this );

	this.sphericalHarmonics3 = sphericalHarmonics3;
	this.intensity = intensity;

	this.type = 'SphericalHarmonicsLight';

	this.castShadow = undefined;

}

SphericalHarmonicsLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: SphericalHarmonicsLight,

	isSphericalHarmonicsLight: true,

	getCoefficients: function() {
		var c = [];
		for( var i=0; i<9; i++ ) {
			c.push( this.sphericalHarmonics3.coefficients[i].clone().multiplyScalar(this.intensity) );
		}
		return c;
	}

} );


export { SphericalHarmonicsLight };
