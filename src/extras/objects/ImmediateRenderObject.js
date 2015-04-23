/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ImmediateRenderObject = function () {

	THREE.Object3D.call( this );

	this.render = function ( renderCallback ) {};

};

THREE.ImmediateRenderObject.prototype = Object.create( THREE.Object3D.prototype );
THREE.ImmediateRenderObject.prototype.constructor = THREE.ImmediateRenderObject;
