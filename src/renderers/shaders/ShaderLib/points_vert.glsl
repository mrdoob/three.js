uniform float size;
uniform float height;
uniform float pixelRatio;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <color_vertex>
	#include <begin_vertex>
	#include <project_vertex>

	#ifdef USE_SIZEATTENUATION
		gl_PointSize = size * pixelRatio * ( height * 0.5 / - mvPosition.z );
	#else
		gl_PointSize = size * pixelRatio;
	#endif

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
