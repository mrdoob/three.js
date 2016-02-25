varying vec3 vWorldPosition;

#include <common>
#include <logdepthbuf_pars_vertex>

void main() {

	vWorldPosition = transformDirection( position, modelMatrix );

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	#include <logdepthbuf_vertex>

}
