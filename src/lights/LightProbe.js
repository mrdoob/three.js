/**
 * @author WestLangley / http://github.com/WestLangley
 */

import { AmbientLight } from './AmbientLight.js';

function LightProbe( sh, intensity ) {

	AmbientLight.call( this );

	this.type = 'LightProbe';

	if ( sh !== undefined ) this.sh.copy( sh );

	if ( intensity !== undefined ) this.intensity = intensity;

}

LightProbe.prototype = Object.assign( Object.create( AmbientLight.prototype ), {

	constructor: LightProbe,

	isLightProbe: true,

	isLight: false,

	isAmbientLight: false

} );

export { LightProbe };
