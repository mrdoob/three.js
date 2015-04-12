/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.WebGLProgram = function ( material, parameters, vertexShader, fragmentShader ) {

	this.vertexShader = vertexShader;
	this.fragmentShader = fragmentShader;
	this.webglUniforms = {};
	this.attributes = {};
	this.attributesKeys = [];

	this.material = material;
	this.parameters = parameters;
	this.linkMessage = '';
	this.webglProgram = undefined;

	this.state = THREE.WebGLShader.CompilingState;
	this.code = '';
	this.id = -1;
	this.usedTimes = 1;

};

THREE.WebGLProgram.CompilingState = 0;
THREE.WebGLProgram.CompileErrorState = 1;
THREE.WebGLProgram.LinkingState = 2;
THREE.WebGLProgram.LinkErrorState = 3;
THREE.WebGLProgram.LinkedState = 4;

THREE.WebGLProgram.prototype = {

	constructor: THREE.WebGLProgram

};
