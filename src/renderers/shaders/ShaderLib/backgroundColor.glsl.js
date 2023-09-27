export const vertex = /* glsl */`
void main() {

	gl_Position = vec4( position.xy, 1.0, 1.0 );

}
`;

export const fragment = /* glsl */`
uniform vec3 color;

void main() {

	gl_FragColor = vec4( color, 1.0 );

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`;
