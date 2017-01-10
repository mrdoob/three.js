precision highp float;

attribute vec3 a_position;
attribute vec3 a_color;

varying vec3 v_color;

uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

void main(void) {
	vec4 pos = u_modelViewMatrix * vec4(a_position,1.0);
	v_color = a_color;
	gl_Position = u_projectionMatrix * pos;
}