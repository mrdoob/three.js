#define NORMAL

uniform float opacity;

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )

#if defined(NEEDSGLSL300)
	in vec3 vViewPosition;
#else
	varying vec3 vViewPosition;
#endif

#endif

#ifndef FLAT_SHADED

#if defined(NEEDSGLSL300)
	in vec3 vNormal;
#else
	varying vec3 vNormal;
#endif

#endif

#if defined(NEEDSGLSL300)
out vec4 glFragColor;
#endif

#include <packing>
#include <uv_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>

void main() {

	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>

#if defined(NEEDSGLSL300)
	glFragColor = vec4( packNormalToRGB( normal ), opacity );
#else
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
#endif

}
