/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  fragment_shader: <string>,
 *  vertex_shader: <string>,
 *  uniforms: { "parameter1": { type: "f", value: 1.0 }, "parameter2": { type: "i" value2: 2 } },
 
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  wireframe: <boolean>,
 *  wireframe_linewidth: <float>
 * }
 */

THREE.MeshShaderMaterial = function ( parameters ) {

	this.id = THREE.MeshShaderMaterialCounter.value ++;

	this.fragment_shader = "void main() {}";
	this.vertex_shader = "void main() {}";
    this.uniforms = {};

	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;

	this.wireframe = false;
	this.wireframe_linewidth = 1;
	this.wireframe_linecap = 'round';
	this.wireframe_linejoin = 'round';

	if ( parameters ) {

        if ( parameters.fragment_shader !== undefined ) this.fragment_shader = parameters.fragment_shader;
        if ( parameters.vertex_shader !== undefined ) this.vertex_shader = parameters.vertex_shader;

        if ( parameters.uniforms !== undefined ) this.uniforms = parameters.uniforms;

		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframe_linewidth !== undefined ) this.wireframe_linewidth = parameters.wireframe_linewidth;
		if ( parameters.wireframe_linecap !== undefined ) this.wireframe_linecap = parameters.wireframe_linecap;
		if ( parameters.wireframe_linejoin !== undefined ) this.wireframe_linejoin = parameters.wireframe_linejoin;

	}

	this.toString = function () {

		return 'THREE.MeshShaderMaterial (<br/>' +
			'id: ' + this.id + '<br/>' +
        
			'blending: ' + this.blending + '<br/>' +
			'wireframe: ' + this.wireframe + '<br/>' +
			'wireframe_linewidth: ' + this.wireframe_linewidth +'<br/>' +
			'wireframe_linecap: ' + this.wireframe_linecap +'<br/>' +
			'wireframe_linejoin: ' + this.wireframe_linejoin +'<br/>' +
			')';

	};

}

THREE.MeshShaderMaterialCounter = { value: 0 };
