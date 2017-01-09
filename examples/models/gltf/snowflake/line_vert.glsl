precision highp float;

attribute vec3 position;
attribute vec3 color;

varying vec3 v_color;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main(void) {
	vec4 pos = modelViewMatrix * vec4(position,1.0);
	v_color = color;
	gl_Position = projectionMatrix * pos;
}