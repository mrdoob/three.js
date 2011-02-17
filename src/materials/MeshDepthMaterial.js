/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  opacity: <float>,
 
 *  blending: THREE.NormalBlending,
 *  depth_test: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframe_linewidth: <float>
 * } 
 */

THREE.MeshDepthMaterial = function ( parameters ) {

	this.id = THREE.MaterialCounter.value ++;
	
	this.opacity = 1.0;
	
	this.shading = THREE.SmoothShading; // doesn't really apply here, normals are not used
	this.blending = THREE.NormalBlending;
	this.depth_test = true;
	
	this.wireframe = false;
	this.wireframe_linewidth = 1.0;

	if ( parameters ) {

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		
		if ( parameters.shading !== undefined ) this.shading  = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.depth_test !== undefined ) this.depth_test = parameters.depth_test;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;
		
	}

};

THREE.MeshDepthMaterial.prototype = {

	toString: function () {

		return 'THREE.MeshDepthMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
		
			'opacity: ' + this.opacity + '<br/>' +
			'blending: ' + this.blending + '<br/>' +
			'depth_test: ' + this.depth_test + '<br/>' +
		
			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_linewidth: ' + this.wireframe_linewidth + '<br/>' +
		')';

	}

};
