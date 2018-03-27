#define NORMAL

uniform float opacity;

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )

	in vec3 vViewPosition;

#endif

#ifndef FLAT_SHADED

	in vec3 vNormal;

#endif

out vec4 glFragColor;

#include <packing>
#include <uv_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>

void main() {

	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>

	glFragColor = vec4( packNormalToRGB( normal ), opacity );

}
