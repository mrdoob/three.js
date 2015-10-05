/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Group = function Group () {

	THREE.Object3D.call( this );

};

THREE.Group.prototype = Object.create( THREE.Object3D.prototype );
THREE.Group.prototype.constructor = THREE.Group;
