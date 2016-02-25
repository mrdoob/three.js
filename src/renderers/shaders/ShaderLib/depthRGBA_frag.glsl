#include <common>
#include <logdepthbuf_pars_fragment>

vec4 pack_depth( const in float depth ) {

	const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
	const vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
	vec4 res = mod( depth * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );
	res -= res.xxyz * bit_mask;
	return res;

}

void main() {

	#include <logdepthbuf_fragment>

	#ifdef USE_LOGDEPTHBUF_EXT

		gl_FragData[ 0 ] = pack_depth( gl_FragDepthEXT );

	#else

		gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );

	#endif

	//gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z / gl_FragCoord.w );
	//float z = ( ( gl_FragCoord.z / gl_FragCoord.w ) - 3.0 ) / ( 4000.0 - 3.0 );
	//gl_FragData[ 0 ] = pack_depth( z );
	//gl_FragData[ 0 ] = vec4( z, z, z, 1.0 );

}
