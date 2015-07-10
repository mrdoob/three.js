/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Group = function () {

	THREE.Object3D.call( this );

	this.type = 'Group';

};

THREE.Group.prototype = Object.create( THREE.Object3D.prototype );
THREE.Group.prototype.constructor = THREE.Group;

THREE.Group.prototype.clone = function ( object ) {

	if ( object === undefined ) object = new THREE.Group();

	THREE.Object3D.prototype.clone.call( this, object );

	return object;

};