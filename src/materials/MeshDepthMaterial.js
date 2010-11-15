/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  near: <float>,
 *  far: <float>,
 *  opacity: <float>
 * } 
 */

THREE.MeshDepthMaterial = function ( parameters ) {

	this.near = 1;
	this.far = 1000;
	this.opacity = 1;

	if ( parameters ) {

		if ( parameters.near !== undefined ) this.near = parameters.near;
		if ( parameters.far !== undefined ) this.far = parameters.far;
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;

	}

	this.__2near = 2 * this.near;
	this.__farPlusNear = this.far + this.near;
	this.__farMinusNear = this.far - this.near;

	this.toString = function () {

		return 'THREE.MeshDepthMaterial';

	};

}
