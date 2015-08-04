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
	return bone.copy( this );

};

THREE.Bone.prototype.copy = function ( source ) {

	THREE.Object3D.prototype.copy.call( this, source );
	this.skin = source.skin;

	return this;

};
