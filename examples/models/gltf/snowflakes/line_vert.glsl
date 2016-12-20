precision highp float;

attribute vec3 position;
attribute vec3 color;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec3 vertexColor;

void main(void) {

	vec4 pos = modelViewMatrix * vec4(position,1.0);
	vertexColor = vec3(color.x, color.y, color.y);
	gl_Position = projectionMatrix * pos;
	
}