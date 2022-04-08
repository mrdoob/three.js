export const vertex = /* glsl */`
varying vec2 vUv;
uniform mat3 uvTransform;

void main() {

	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

	gl_Position = vec4( position.xy, 1.0, 1.0 );

}
`;

export const fragment = /* glsl */`
uniform sampler2D t2D;

varying vec2 vUv;

void main() {

	gl_FragColor = texture2D( t2D, vUv );

	#ifdef DECODE_VIDEO_TEXTURE

		// inline sRGB decode (TODO: Remove this code when https://crbug.com/1256340 is solved)

		gl_FragColor = vec4( mix( pow( gl_FragColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), gl_FragColor.rgb * 0.0773993808, vec3( lessThanEqual( gl_FragColor.rgb, vec3( 0.04045 ) ) ) ), gl_FragColor.w );

	#endif

	#include <tonemapping_fragment>
	#include <encodings_fragment>

}
`;
