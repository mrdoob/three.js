export default /* glsl */`
uniform sampler2D t2D;

varying vec2 vUv;

void main() {

	if ( vUv.x < 0.0 || vUv.x > 1.0 ) discard; // works, but it messes up repeated textures in other use cases
	if ( vUv.y < 0.0 || vUv.y > 1.0 ) discard;

	vec4 texColor = texture2D( t2D, vUv );

	gl_FragColor = mapTexelToLinear( texColor );

	#include <tonemapping_fragment>
	#include <encodings_fragment>

}
`;
