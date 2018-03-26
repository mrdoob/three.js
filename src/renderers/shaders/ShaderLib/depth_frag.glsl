#if DEPTH_PACKING == 3200

	uniform float opacity;

#endif

#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

#if defined(NEEDSGLSL300)
out vec4 glFragColor;
#endif


void main() {

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( 1.0 );

	#if DEPTH_PACKING == 3200

		diffuseColor.a = opacity;

	#endif

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>

	#include <logdepthbuf_fragment>

	#if DEPTH_PACKING == 3200

#if defined(NEEDSGLSL300)
		glFragColor = vec4( vec3( gl_FragCoord.z ), opacity );
#else
		gl_FragColor = vec4( vec3( 1.0 - gl_FragCoord.z ), opacity );
#endif

	#elif DEPTH_PACKING == 3201

#if defined(NEEDSGLSL300)
		glFragColor = packDepthToRGBA( gl_FragCoord.z );
#else
		gl_FragColor = packDepthToRGBA( gl_FragCoord.z );
#endif

	#endif

}
