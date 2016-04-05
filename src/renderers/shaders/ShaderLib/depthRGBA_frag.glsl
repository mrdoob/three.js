#include <common>
#include <logdepthbuf_pars_fragment>
#include <packing>

void main() {

	#include <logdepthbuf_fragment>

	#ifdef USE_LOGDEPTHBUF_EXT

		float depth = gl_FragDepthEXT;

	#else

		float depth = gl_FragCoord.z;

	#endif

	gl_FragData[ 0 ] = packLinearUnitToRGBA( depth );

}
