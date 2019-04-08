import { Light } from './Light.js';

/**
* @author Richard M. / https://github.com/richardmonette
*/

function ProbeLight( color, intensity ) {

	Light.call( this, color, intensity );

	this.type = 'ProbeLight';

	this.castShadow = undefined;

}

ProbeLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: ProbeLight,

	isProbeLight: true

} );


export { ProbeLight };
