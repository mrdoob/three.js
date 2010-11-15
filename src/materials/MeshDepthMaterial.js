/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  near: <float>,
 *  far: <float>,
 *  wireframe: <boolean>,
 *  wireframe_linewidth: <float>
 * } 
 */

THREE.MeshDepthMaterial = function ( parameters ) {

	this.near = 1;
	this.far = 1000;
	this.opacity = 1;
	this.wireframe = false;
	this.wireframe_linewidth = 1;

	if ( parameters ) {

		if ( parameters.near !== undefined ) this.near = parameters.near;
		if ( parameters.far !== undefined ) this.far = parameters.far;
		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;

	}

	this.__2near = 2 * this.near;
	this.__farPlusNear = this.far + this.near;
	this.__farMinusNear = this.far - this.near;

	this.toString = function () {

		return 'THREE.MeshDepthMaterial';

	};

}
