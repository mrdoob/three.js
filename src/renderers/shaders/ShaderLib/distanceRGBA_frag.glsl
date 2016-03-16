uniform vec3 lightPos;
varying vec4 vWorldPosition;

#include <common>

vec4 pack1K ( float depth ) {

	depth /= 1000.0;
	const vec4 bitSh = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
	const vec4 bitMsk = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
	vec4 res = mod( depth * bitSh * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );
	res -= res.xxyz * bitMsk;
	return res;

}

float unpack1K ( vec4 color ) {

	const vec4 bitSh = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );
	return dot( color, bitSh ) * 1000.0;

}

void main () {

	gl_FragColor = pack1K( length( vWorldPosition.xyz - lightPos.xyz ) );

}
