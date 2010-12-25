/**
 * @author mr.doob / http://mrdoob.com/
 *
 * parameters = {
 *  opacity: <float>,
 *  blending: THREE.NormalBlending
 * } 
 */

THREE.MeshDepthMaterial = function ( parameters ) {

	this.opacity = 1;
	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;

	this.wireframe = false;
	this.wireframe_linewidth = 1;
	this.wireframe_linecap = 'round';
	this.wireframe_linejoin = 'round';

	if ( parameters ) {

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

	}

};

THREE.MeshDepthMaterial.prototype = {

	toString: function () {

		return 'THREE.MeshDepthMaterial';

	}

};
