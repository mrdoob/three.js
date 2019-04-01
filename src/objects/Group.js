import { Object3D } from '../core/Object3D.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function Group() {

	Object3D.call( this );

	this.type = 'Group';

}

Group.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Group,

	isGroup: true

} );


export { Group };
