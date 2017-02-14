#define NORMAL

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )

	varying vec3 vViewPosition;

#endif

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>

void main() {

	#include <common_vertex>

	vNormal = normalize( normalMatrix * normal );

	#include <begin_vertex>
	#include <displacementmap_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP )

	vViewPosition = - mvPosition.xyz;

#endif

}
