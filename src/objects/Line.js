/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.Line = function ( geometry, material ) {

	THREE.Object3D.call( this );

	this.geometry = geometry;
	this.material = material instanceof Array ? material : [ material ];

};

THREE.Line.prototype = new THREE.Object3D();
THREE.Line.prototype.constructor = THREE.Line;
