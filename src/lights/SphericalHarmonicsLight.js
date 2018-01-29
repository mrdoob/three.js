import { Light } from './Light.js';

/**
 * @author Andreas Atteneder
 */

function SphericalHarmonicsLight( sh, intensity ) {

	Light.call( this );

	this.sh = sh;
	this.intensity =  (intensity === undefined || typeof intensity !== 'number') ? 1.0 : intensity;

	this.type = 'SphericalHarmonicsLight';

	this.castShadow = undefined;

}

SphericalHarmonicsLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: SphericalHarmonicsLight,

	isSphericalHarmonicsLight: true,

	getCoefficients: function () {

		var coefficients = this.sh.toArray();
		for ( var i = 0; i < 9; i ++ ) {
			coefficients[i].multiplyScalar( this.intensity );
		}
		
		return coefficients;
	}

} );


export { SphericalHarmonicsLight };
