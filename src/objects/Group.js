/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Group = function () {

	THREE.Object3D.call( this );

	this.type = 'Group';

};

THREE.Group.prototype = Object.create( THREE.Object3D.prototype );
THREE.Group.prototype.constructor = THREE.Group;

THREE.Group.prototype.clone = function () {

	var group = new THREE.Group();
	return this.cloneProperties( group );

};

THREE.Group.prototype.cloneProperties = function ( group ) {

	THREE.Object3D.prototype.cloneProperties.call( this, group );
	return group;

};
