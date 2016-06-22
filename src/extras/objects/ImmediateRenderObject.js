/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ImmediateRenderObject = function ( material ) {

	THREE.Object3D.call( this );

	this.material = material;
	this.render = function ( renderCallback ) {};

};

THREE.ImmediateRenderObject.prototype = Object.create( THREE.Object3D.prototype );
THREE.ImmediateRenderObject.prototype.constructor = THREE.ImmediateRenderObject;
