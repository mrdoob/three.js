/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

THREE.Bone = function ( belongsToSkin ) {

	THREE.Object3D.call( this );

	this.skin = belongsToSkin;

};

THREE.Bone.prototype = Object.create( THREE.Object3D.prototype );
THREE.Bone.prototype.constructor = THREE.Bone;

