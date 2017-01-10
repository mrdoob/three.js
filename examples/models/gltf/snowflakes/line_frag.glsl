precision highp float;
varying vec3 v_color;

void main(void) {

	gl_FragColor = vec4(v_color.r, v_color.g, v_color.b, 1.0);;
	
}
