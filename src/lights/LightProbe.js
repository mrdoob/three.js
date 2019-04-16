import { Object3D } from '../core/Object3D.js';

/**
 * @author WestLangley / http://github.com/WestLangley
 */

function LightProbe( ) {

	Object3D.call( this );

	this.type = 'LightProbe';

}

LightProbe.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: LightProbe,

	isLightProbe: true,

	copy: function ( source ) {

		Object3D.prototype.copy.call( this, source );

		return this;

	},

} );


export { LightProbe };
