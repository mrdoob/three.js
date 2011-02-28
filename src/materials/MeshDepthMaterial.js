/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  opacity: <float>,
 
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * } 
 */

THREE.MeshDepthMaterial = function ( parameters ) {

	this.id = THREE.MaterialCounter.value ++;

	this.opacity = 1.0;

	this.shading = THREE.SmoothShading; // doesn't really apply here, normals are not used
	this.blending = THREE.NormalBlending;
	this.depthTest = true;

	this.wireframe = false;
	this.wireframeLinewidth = 1.0;

	if ( parameters ) {

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;

		if ( parameters.shading !== undefined ) this.shading  = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.depthTest !== undefined ) this.depthTest = parameters.depthTest;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframeLinewidth !== undefined ) this.wireframeLinewidth = parameters.wireframeLinewidth;

	}

};
