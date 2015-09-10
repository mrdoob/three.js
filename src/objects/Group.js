/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = Group;

var Object3D = require( "../core/Object3D" );

function Group() {

	Object3D.call( this );

	this.type = "Group";

}

Group.prototype = Object.create( Object3D.prototype );
Group.prototype.constructor = Group;