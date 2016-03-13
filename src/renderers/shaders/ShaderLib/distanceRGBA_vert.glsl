varying vec4 vWorldPosition;

#include <common>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>

void main() {

	#include <skinbase_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>

	vWorldPosition = worldPosition;

}
