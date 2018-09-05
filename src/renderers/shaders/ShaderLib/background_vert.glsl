varying vec2 vUv;

void main() {

	vUv = uv;

	gl_Position = vec4( position, 1.0 );
	gl_Position.z = 1.0;

}
