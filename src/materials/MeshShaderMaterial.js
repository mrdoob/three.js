/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  fragmentShader: <string>,
 *  vertexShader: <string>,
 
 *  uniforms: { "parameter1": { type: "f", value: 1.0 }, "parameter2": { type: "i" value2: 2 } },
 
 *  shading: THREE.SmoothShading,
 *  blending: THREE.NormalBlending,
 *  depthTest: <bool>,
 
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 
 *  lights: <bool>,
 *  vertexColors: <bool>,
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 * }
 */

THREE.MeshShaderMaterial = function ( parameters ) {

	this.id = THREE.MaterialCounter.value ++;

	this.fragmentShader = "void main() {}";
	this.vertexShader = "void main() {}";
	this.uniforms = {};

	this.opacity = 1.0; // set to < 1.0 to renderer in transparent batch

	this.shading = THREE.SmoothShading;
	this.blending = THREE.NormalBlending;
	this.depthTest = true;

	this.wireframe = false;
	this.wireframeLinewidth = 1.0;
	this.wireframeLinecap = 'round';	// doesn't make sense here
	this.wireframeLinejoin = 'round';  	// not implemented in WebGLRenderer (and this material doesn't make sense in CanvasRenderer)

	this.lights = false; 		// set to use scene lights
	this.vertexColors = false; 	// set to use "color" attribute stream
	this.skinning = false;		// set to use skinning attribute streams
	this.morphTargets = false; 	// set to use morph targets

	if ( parameters ) {

		if ( parameters.fragmentShader !== undefined ) this.fragmentShader = parameters.fragmentShader;
		if ( parameters.vertexShader !== undefined ) this.vertexShader = parameters.vertexShader;

		if ( parameters.uniforms !== undefined ) this.uniforms = parameters.uniforms;

		if ( parameters.opacity !== undefined ) this.opacity  = parameters.opacity;

		if ( parameters.shading !== undefined ) this.shading = parameters.shading;
		if ( parameters.blending !== undefined ) this.blending = parameters.blending;
		if ( parameters.depthTest !== undefined ) this.depthTest = parameters.depthTest;

		if ( parameters.wireframe !== undefined ) this.wireframe = parameters.wireframe;
		if ( parameters.wireframeLinewidth !== undefined ) this.wireframeLinewidth = parameters.wireframeLinewidth;
		if ( parameters.wireframeLinecap !== undefined ) this.wireframeLinecap = parameters.wireframeLinecap;
		if ( parameters.wireframeLinejoin !== undefined ) this.wireframeLinejoin = parameters.wireframeLinejoin;

		if ( parameters.lights !== undefined ) this.lights = parameters.lights;
		if ( parameters.vertexColors !== undefined ) this.vertexColors = parameters.vertexColors;
		if ( parameters.skinning !== undefined ) this.skinning = parameters.skinning;
		if ( parameters.morphTargets !== undefined ) this.morphTargets = parameters.morphTargets;

	}

};
