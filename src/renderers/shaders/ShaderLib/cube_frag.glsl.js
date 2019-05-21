export default /* glsl */`
uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
uniform mat3 cubeRotation;

varying vec3 vWorldDirection;

void main() {
	vec4 texColor = textureCube( tCube, cubeRotation * vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );

	gl_FragColor = mapTexelToLinear( texColor );
	gl_FragColor.a *= opacity;

	#include <tonemapping_fragment>
	#include <encodings_fragment>

}
`;
