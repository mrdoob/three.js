/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * A LightProbe is a source of indirect-diffuse light
 */

import { SphericalHarmonics3 } from '../math/SphericalHarmonics3.js';
import { Light } from './Light.js';

function LightProbe( sh, intensity ) {

	Light.call( this, undefined, intensity );

	this.type = 'LightProbe';

	this.sh = ( sh !== undefined ) ? sh : new SphericalHarmonics3();

}

LightProbe.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: LightProbe,

	isLightProbe: true,

	copy: function ( source ) {

		Light.prototype.copy.call( this, source );

		this.sh.copy( source.sh );

		return this;

	},

	fromJSON: function ( json ) {

		this.intensity = json.intensity; // TODO: Move this bit to Light.fromJSON();
		this.sh.fromArray( json.sh );

		return this;

	},

	toJSON: function ( meta ) {

		var data = Light.prototype.toJSON.call( this, meta );

		data.object.sh = this.sh.toArray();

		return data;

	}

} );

export { LightProbe };
