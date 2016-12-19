precision highp float;
varying vec3 vertexColor;

void main(void) {

	gl_FragColor = vec4(vertexColor.r, vertexColor.g, vertexColor.b, 1.0);;
	
}
