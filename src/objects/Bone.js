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

THREE.Bone.prototype.clone = function () {

	var bone = new THREE.Bone( this.skin );
	return this.cloneProperties( bone );

};

THREE.Bone.prototype.cloneProperties = function ( bone ) {

	THREE.Object3D.prototype.cloneProperties.call( this, bone );
	bone.skin = this.skin;

	return bone;

};
