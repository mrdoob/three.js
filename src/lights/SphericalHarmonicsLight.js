import { Light } from './Light.js';

/**
 * @author Andreas Atteneder
 */

function SphericalHarmonicsLight( values ) {

	Light.call( this );

	this.values = values;

	this.type = 'SphericalHarmonicsLight';

	this.castShadow = undefined;

}

SphericalHarmonicsLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: SphericalHarmonicsLight,

	isSphericalHarmonicsLight: true

} );


export { SphericalHarmonicsLight };
