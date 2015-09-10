/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

module.exports = Bone;

var Object3D = require( "../core/Object3D" );

function Bone( skin ) {

	Object3D.call( this );

	this.type = "Bone";

	this.skin = skin;

}

Bone.prototype = Object.create( Object3D.prototype );
Bone.prototype.constructor = Bone;

Bone.prototype.copy = function ( source ) {
	
	Object3D.prototype.copy.call( this, source );
	
	this.skin = source.skin;
	
	return this;

};
