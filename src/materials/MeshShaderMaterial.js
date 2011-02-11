/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  fragment_shader: <string>,
 *  vertex_shader: <string>,
 
 *  uniforms: { "parameter1": { type: "f", value: 1.0 }, "parameter2": { type: "i" value2: 2 } },
 
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depth_test: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframe_linewidth: <float>,
 
 *  vertex_colors: <bool>
 * }
 */

THREE.MeshShaderMaterial = function ( parameters ) {

	this.id = THREE.MeshShaderMaterialCounter.value ++;

	this.fragment_shader = "void main() {}";
	this.vertex_shader = "void main() {}";
	this.uniforms = {};

	this.opacity = 1.0; // set to < 1.0 to renderer in transparent batch
	
	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;
	this.depth_test = true;

	this.wireframe = false;
	this.wireframe_linewidth = 1.0;
	this.wireframe_linecap = 'round';	// doesn't make sense here
	this.wireframe_linejoin = 'round';  // not implemented in WebGLRenderer (and this material doesn't make sense in CanvasRenderer)

	this.vertex_colors = false; // must set this if shader wants to use "color" attribute stream

	if ( parameters ) {

		if ( parameters.fragment_shader !== undefined ) this.fragment_shader = parameters.fragment_shader;
		if ( parameters.vertex_shader !== undefined ) this.vertex_shader = parameters.vertex_shader;

		if ( parameters.uniforms !== undefined ) this.uniforms = parameters.uniforms;

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;
		
		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.depth_test !== undefined ) this.depth_test = parameters.depth_test;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;
		if ( parameters.wireframe_linecap !== undefined ) this.wireframe_linecap = parameters.wireframe_linecap;
		if ( parameters.wireframe_linejoin !== undefined ) this.wireframe_linejoin = parameters.wireframe_linejoin;
		
		if ( parameters.vertex_colors !== undefined ) this.vertex_colors = parameters.vertex_colors;

	}

};

THREE.MeshShaderMaterial.prototype = {

	toString: function () {

		return 'THREE.MeshShaderMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +

			'blending: ' + this.blending + '<br/>' +
			'depth_test: ' + this.depth_test + '<br/>' +
		
			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_linewidth: ' + this.wireframe_linewidth +'<br/>' +
			'wireframe_linecap: ' + this.wireframe_linecap +'<br/>' +
			'wireframe_linejoin: ' + this.wireframe_linejoin +'<br/>' +
		
			'vertex_colors: ' + this.vertex_colors + '<br/>' +
			')';

	}

};

THREE.MeshShaderMaterialCounter = { value: 0 };
