#include <common>
#include <packing>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>

	#ifdef USE_LOGDEPTHBUF_EXT

		float depth = gl_FragDepthEXT;

	#else

		float depth = gl_FragCoord.z;

	#endif

	gl_FragData[ 0 ] = packLinearUnitToRGBA( depth );

}
