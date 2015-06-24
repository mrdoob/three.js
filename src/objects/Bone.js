/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

THREE.Bone = function ( skin ) {

	THREE.Object3D.call( this );

	this.type = 'Bone';

	this.skin = skin;

};

THREE.Bone.prototype = Object.create( THREE.Object3D.prototype );
THREE.Bone.prototype.constructor = THREE.Bone;

THREE.Bone.prototype.clone = function ( object ) {

	if ( object === undefined ) object = new THREE.Bone( this.skin );

	THREE.Object3D.prototype.clone.call( this, object );
	object.skin = this.skin; 

	return object;

};