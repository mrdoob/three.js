import { Object3D } from '../core/Object3D';

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

function Bone( skin ) {

	Object3D.call( this );

	this.type = 'Bone';

	this.skin = skin;

}

Bone.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Bone,

	isBone: true,

	copy: function ( source ) {

		Object3D.prototype.copy.call( this, source );

		this.skin = source.skin;

		return this;

	}

} );


export { Bone };
