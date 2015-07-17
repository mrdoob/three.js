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
	return group._copyFrom( this );

};

THREE.Group.prototype._copyFrom = function ( source ) {

	THREE.Object3D.prototype._copyFrom.call( this, source );
	return this;

};
