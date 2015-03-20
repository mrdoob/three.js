#include "common.glsl"
#include "map_pars_vertex"
#include "lightmap_pars_vertex"
#include "envmap_pars_vertex"
#include "color_pars_vertex"
#include "morphtarget_pars_vertex"
#include "skinning_pars_vertex"
#include "shadowmap_pars_vertex"
#include "logdepthbuf_pars_vertex"

void main() {

	#include "map_vertex"
	#include "lightmap_vertex"
	#include "color_vertex"
	#include "skinbase_vertex"

	#ifdef USE_ENVMAP

		#include "morphnormal_vertex"
		#include "skinnormal_vertex"
		#include "defaultnormal_vertex"

	#endif",

	#include "morphtarget_vertex"
	#include "skinning_vertex"
	#include "default_vertex"
	#include "logdepthbuf_vertex"

	#include "worldpos_vertex"
	#include "envmap_vertex"
	#include "shadowmap_vertex"

}