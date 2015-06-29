/**
 * @author alteredq / http://alteredqualia.com
 * @author prafullit
 */

THREE.WebGLRenderTargetCube = function ( width, height, options ) {

	THREE.WebGLRenderTarget.call( this, width, height, options );

	this.activeCubeFace = 0; // PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5

};

THREE.WebGLRenderTargetCube.prototype = Object.create( THREE.WebGLRenderTarget.prototype );
THREE.WebGLRenderTargetCube.prototype.constructor = THREE.WebGLRenderTargetCube;

THREE.WebGLRenderTargetCube.prototype.clone = function (object) {

	if( object === undefined ) object = new THREE.WebGLRenderTargetCube( this.width, this.height );
	THREE.WebGLRenderTarget.prototype.clone.call( this, object );
	
	object.activeCubeFace=this.activeCubeFace;
	
	return object;

};
