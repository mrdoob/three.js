import { Object3D } from '../core/Object3D';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function Group () {
	this.isGroup = true;

	Object3D.call( this );

	this.type = 'Group';

};

Group.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Group

} );


export { Group };