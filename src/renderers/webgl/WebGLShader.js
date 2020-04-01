/**
 * @author mrdoob / http://mrdoob.com/
 */

function WebGLShader( gl, type, string ) {

	var shader = gl.createShader( type );

	gl.shaderSource( shader, string );
	gl.compileShader( shader );

	/* TODO: would we like to add this code. it's straight from https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader
	if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
    var info = gl.getShaderInfoLog( shader );
    throw 'Could not compile WebGL program. \n\n' + info;
	}
	*/

	return shader;

}

export { WebGLShader };
