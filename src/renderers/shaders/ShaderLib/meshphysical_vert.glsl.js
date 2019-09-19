export default /* glsl */`
#define STANDARD

varying vec3 vViewPosition;

#if !defined( FLAT_SHADED ) || defined( USE_TANGENT )

	varying vec3 vNormal;

#endif

#ifdef USE_TANGENT

	varying vec3 vTangent;
	varying vec3 vBitangent;

#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

#if !defined( FLAT_SHADED ) || defined( USE_TANGENT ) // Normal computed with derivatives when FLAT_SHADED

	vNormal = normalize( transformedNormal );

#endif

#ifdef USE_TANGENT

	vTangent = normalize( transformedTangent );
	vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );

#endif

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
`;
