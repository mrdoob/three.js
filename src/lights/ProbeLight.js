import { Light } from './Light.js';

/**
* @author Richard M. / https://github.com/richardmonette
*/

function ProbeLight( coefficients, intensity ) {

	Light.call( this, null, intensity );

  this.coefficients = coefficients;

	this.type = 'ProbeLight';

	this.castShadow = undefined;

}

ProbeLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: ProbeLight,

	isProbeLight: true

} );


export { ProbeLight };
