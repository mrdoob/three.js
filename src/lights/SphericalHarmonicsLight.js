import { Light } from './Light.js';

/**
 * @author Andreas Atteneder
 */

function SphericalHarmonicsLight( sphericalHarmonics3 ) {

	Light.call( this );

	this.sphericalHarmonics3 = sphericalHarmonics3;

	this.type = 'SphericalHarmonicsLight';

	this.castShadow = undefined;

}

SphericalHarmonicsLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: SphericalHarmonicsLight,

	isSphericalHarmonicsLight: true

} );


export { SphericalHarmonicsLight };
