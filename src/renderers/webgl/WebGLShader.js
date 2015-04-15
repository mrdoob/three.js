/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.WebGLShader = function ( type, webglShader ) {

	this.state = THREE.WebGLShader.CompilingState;
	this.type = type;
	this.webglShader = webglShader;
	this.usedTimes = 1;
	this.compileMessage = '';
	this.source = '';

};

THREE.WebGLShader.CompilingState = 0;
THREE.WebGLShader.CompileErrorState = 1;
THREE.WebGLShader.CompiledState = 2;

THREE.WebGLShader.prototype = {

	constructor: THREE.WebGLShader

};
