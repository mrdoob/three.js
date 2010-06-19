/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Line = function ( geometry, material ) {

	THREE.Object3D.call( this, material );

	this.geometry = geometry;

};

THREE.Line.prototype = new THREE.Object3D();
THREE.Line.prototype.constructor = THREE.Line;
