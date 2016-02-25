varying vec3 vNormal;

#include <common>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>

void main() {

	vNormal = normalize( normalMatrix * normal );

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>

}
