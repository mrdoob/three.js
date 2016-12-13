uniform float opacity;
varying vec3 vNormal;

#include <common>
#include <packing>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>
	#include <normal_flip>
   
   	gl_FragColor = vec4( packNormalToRGB( vNormal * flipNormal ), opacity );

	#include <logdepthbuf_fragment>

}
