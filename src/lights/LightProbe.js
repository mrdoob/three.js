/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * A LightProbe is a source of indirect-diffuse light
 */

import { SphericalHarmonics3 } from '../math/SphericalHarmonics3.js';
import { Light } from './Light.js';

function LightProbe( sh, intensity ) {

	Light.call( this, undefined, intensity );

	this.sh = ( sh !== undefined ) ? sh : new SphericalHarmonics3();

}

LightProbe.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: LightProbe,

	isLightProbe: true,

	copy: function ( source ) {

		Light.prototype.copy.call( this, source );

		this.sh.copy( source.sh );
		this.intensity = source.intensity;

		return this;

	},

	toJSON: function ( meta ) {

		var data = Light.prototype.toJSON.call( this, meta );

		// data.sh = this.sh.toArray(); // todo

		return data;

	}

} );

export { LightProbe };
